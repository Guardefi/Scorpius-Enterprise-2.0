"""
Advanced async task queue system for background processing.

This module provides a high-performance task queue with priority handling,
retry logic, and monitoring for compute-intensive operations.
"""

import asyncio
import time
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Callable, Awaitable
from uuid import uuid4, UUID
from dataclasses import dataclass
from functools import wraps

from ..core.logging import get_logger
from ..core.exceptions import TaskError

logger = get_logger(__name__)


class TaskStatus(str, Enum):
    """Task execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"


class TaskPriority(int, Enum):
    """Task priority levels."""
    LOW = 1
    NORMAL = 5
    HIGH = 8
    CRITICAL = 10


@dataclass
class TaskResult:
    """Task execution result."""
    task_id: UUID
    status: TaskStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None
    retry_count: int = 0
    created_at: datetime = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()


@dataclass
class TaskDefinition:
    """Task definition with metadata."""
    task_id: UUID
    name: str
    func: Callable[..., Awaitable[Any]]
    args: tuple
    kwargs: dict
    priority: TaskPriority = TaskPriority.NORMAL
    max_retries: int = 3
    timeout: Optional[float] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()


class TaskQueue:
    """High-performance async task queue with priority handling."""
    
    def __init__(
        self,
        max_workers: int = 4,
        max_queue_size: int = 1000,
        default_timeout: float = 300.0
    ):
        """Initialize task queue."""
        self.max_workers = max_workers
        self.max_queue_size = max_queue_size
        self.default_timeout = default_timeout
        
        # Task storage
        self._pending_tasks: List[TaskDefinition] = []
        self._running_tasks: Dict[UUID, TaskDefinition] = {}
        self._completed_tasks: Dict[UUID, TaskResult] = {}
        
        # Worker management
        self._workers: List[asyncio.Task] = []
        self._worker_semaphore = asyncio.Semaphore(max_workers)
        self._task_event = asyncio.Event()
        self._shutdown_event = asyncio.Event()
        
        # Metrics
        self._metrics = {
            "tasks_submitted": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "total_execution_time": 0.0,
            "start_time": datetime.utcnow()
        }
        
        self._running = False
    
    async def start(self):
        """Start the task queue workers."""
        if self._running:
            return
            
        self._running = True
        self._shutdown_event.clear()
        
        # Start worker tasks
        for i in range(self.max_workers):
            worker = asyncio.create_task(self._worker_loop(f"worker-{i}"))
            self._workers.append(worker)
        
        logger.info(f"Task queue started with {self.max_workers} workers")
    
    async def stop(self, timeout: float = 30.0):
        """Stop the task queue and wait for workers to finish."""
        if not self._running:
            return
        
        logger.info("Stopping task queue...")
        self._shutdown_event.set()
        
        # Wait for workers to finish
        try:
            await asyncio.wait_for(
                asyncio.gather(*self._workers, return_exceptions=True),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            logger.warning("Task queue shutdown timeout, cancelling workers")
            for worker in self._workers:
                if not worker.done():
                    worker.cancel()
        
        self._workers.clear()
        self._running = False
        logger.info("Task queue stopped")
    
    async def submit_task(
        self,
        func: Callable[..., Awaitable[Any]],
        *args,
        name: Optional[str] = None,
        priority: TaskPriority = TaskPriority.NORMAL,
        max_retries: int = 3,
        timeout: Optional[float] = None,
        **kwargs
    ) -> UUID:
        """Submit a task for execution."""
        if len(self._pending_tasks) >= self.max_queue_size:
            raise TaskError("Task queue is full")
        
        task_id = uuid4()
        task_name = name or f"{func.__name__}_{task_id.hex[:8]}"
        
        task = TaskDefinition(
            task_id=task_id,
            name=task_name,
            func=func,
            args=args,
            kwargs=kwargs,
            priority=priority,
            max_retries=max_retries,
            timeout=timeout or self.default_timeout
        )
        
        # Insert task in priority order
        self._insert_task_by_priority(task)
        
        # Create initial result
        self._completed_tasks[task_id] = TaskResult(
            task_id=task_id,
            status=TaskStatus.PENDING
        )
        
        self._metrics["tasks_submitted"] += 1
        self._task_event.set()
        
        logger.debug(f"Task submitted: {task_name} (ID: {task_id})")
        return task_id
    
    def _insert_task_by_priority(self, task: TaskDefinition):
        """Insert task maintaining priority order."""
        inserted = False
        for i, existing_task in enumerate(self._pending_tasks):
            if task.priority.value > existing_task.priority.value:
                self._pending_tasks.insert(i, task)
                inserted = True
                break
        
        if not inserted:
            self._pending_tasks.append(task)
    
    async def get_task_result(self, task_id: UUID) -> Optional[TaskResult]:
        """Get task result by ID."""
        return self._completed_tasks.get(task_id)
    
    async def wait_for_task(
        self, 
        task_id: UUID, 
        timeout: Optional[float] = None
    ) -> TaskResult:
        """Wait for task completion."""
        start_time = time.time()
        
        while True:
            result = await self.get_task_result(task_id)
            if result and result.status in [
                TaskStatus.COMPLETED, 
                TaskStatus.FAILED, 
                TaskStatus.CANCELLED
            ]:
                return result
            
            if timeout and (time.time() - start_time) > timeout:
                raise TaskError(f"Timeout waiting for task {task_id}")
            
            await asyncio.sleep(0.1)
    
    async def cancel_task(self, task_id: UUID) -> bool:
        """Cancel a pending or running task."""
        # Check if task is pending
        for i, task in enumerate(self._pending_tasks):
            if task.task_id == task_id:
                self._pending_tasks.pop(i)
                result = self._completed_tasks.get(task_id)
                if result:
                    result.status = TaskStatus.CANCELLED
                    result.completed_at = datetime.utcnow()
                return True
        
        # Check if task is running
        if task_id in self._running_tasks:
            # Note: Can't easily cancel running asyncio tasks safely
            # Mark as cancelled for result tracking
            result = self._completed_tasks.get(task_id)
            if result:
                result.status = TaskStatus.CANCELLED
                result.completed_at = datetime.utcnow()
            return True
        
        return False
    
    async def _worker_loop(self, worker_name: str):
        """Main worker loop."""
        logger.debug(f"Worker {worker_name} started")
        
        while not self._shutdown_event.is_set():
            try:
                # Wait for tasks or shutdown
                await asyncio.wait_for(
                    self._task_event.wait(),
                    timeout=1.0
                )
                self._task_event.clear()
                
                # Process tasks
                async with self._worker_semaphore:
                    await self._process_next_task(worker_name)
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Worker {worker_name} error: {e}")
                await asyncio.sleep(1.0)
        
        logger.debug(f"Worker {worker_name} stopped")
    
    async def _process_next_task(self, worker_name: str):
        """Process the next available task."""
        if not self._pending_tasks:
            return
        
        task = self._pending_tasks.pop(0)
        self._running_tasks[task.task_id] = task
        
        result = self._completed_tasks[task.task_id]
        result.status = TaskStatus.RUNNING
        result.started_at = datetime.utcnow()
        
        logger.debug(f"Worker {worker_name} executing task: {task.name}")
        
        start_time = time.time()
        try:
            # Execute task with timeout
            task_result = await asyncio.wait_for(
                task.func(*task.args, **task.kwargs),
                timeout=task.timeout
            )
            
            execution_time = time.time() - start_time
            
            # Update result
            result.status = TaskStatus.COMPLETED
            result.result = task_result
            result.execution_time = execution_time
            result.completed_at = datetime.utcnow()
            
            # Update metrics
            self._metrics["tasks_completed"] += 1
            self._metrics["total_execution_time"] += execution_time
            
            logger.debug(f"Task completed: {task.name} in {execution_time:.2f}s")
            
        except asyncio.TimeoutError:
            await self._handle_task_failure(
                task, result, "Task timeout", start_time
            )
        except Exception as e:
            await self._handle_task_failure(
                task, result, str(e), start_time
            )
        finally:
            # Remove from running tasks
            self._running_tasks.pop(task.task_id, None)
    
    async def _handle_task_failure(
        self, 
        task: TaskDefinition, 
        result: TaskResult, 
        error_msg: str,
        start_time: float
    ):
        """Handle task failure with retry logic."""
        execution_time = time.time() - start_time
        result.execution_time = execution_time
        result.error = error_msg
        result.retry_count += 1
        
        if result.retry_count <= task.max_retries:
            # Retry task
            result.status = TaskStatus.RETRYING
            
            # Add back to queue with exponential backoff delay
            delay = min(2 ** result.retry_count, 60)  # Max 60 seconds
            
            async def delayed_retry():
                await asyncio.sleep(delay)
                self._insert_task_by_priority(task)
                self._task_event.set()
            
            asyncio.create_task(delayed_retry())
            
            logger.warning(
                f"Task {task.name} failed (attempt {result.retry_count}), "
                f"retrying in {delay}s: {error_msg}"
            )
        else:
            # Task failed permanently
            result.status = TaskStatus.FAILED
            result.completed_at = datetime.utcnow()
            
            self._metrics["tasks_failed"] += 1
            
            logger.error(
                f"Task {task.name} failed permanently after "
                f"{result.retry_count} attempts: {error_msg}"
            )
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get task queue metrics."""
        uptime = datetime.utcnow() - self._metrics["start_time"]
        
        return {
            "tasks_submitted": self._metrics["tasks_submitted"],
            "tasks_completed": self._metrics["tasks_completed"],
            "tasks_failed": self._metrics["tasks_failed"],
            "tasks_pending": len(self._pending_tasks),
            "tasks_running": len(self._running_tasks),
            "workers_active": len(self._workers),
            "average_execution_time": (
                self._metrics["total_execution_time"] / 
                max(self._metrics["tasks_completed"], 1)
            ),
            "uptime_seconds": uptime.total_seconds(),
            "queue_utilization": len(self._pending_tasks) / self.max_queue_size
        }
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Get detailed queue status."""
        pending_by_priority = {}
        for task in self._pending_tasks:
            priority = task.priority.name
            pending_by_priority[priority] = pending_by_priority.get(priority, 0) + 1
        
        return {
            "running": self._running,
            "pending_tasks": len(self._pending_tasks),
            "running_tasks": len(self._running_tasks),
            "completed_tasks": len(self._completed_tasks),
            "pending_by_priority": pending_by_priority,
            "worker_count": len(self._workers),
            "max_queue_size": self.max_queue_size
        }


# Global task queue instance
_task_queue: Optional[TaskQueue] = None


async def get_task_queue() -> TaskQueue:
    """Get global task queue instance."""
    global _task_queue
    if _task_queue is None:
        _task_queue = TaskQueue()
        await _task_queue.start()
    return _task_queue


def background_task(
    priority: TaskPriority = TaskPriority.NORMAL,
    max_retries: int = 3,
    timeout: Optional[float] = None,
    name: Optional[str] = None
):
    """
    Decorator to submit function as background task.
    
    Args:
        priority: Task priority level
        max_retries: Maximum retry attempts
        timeout: Task timeout in seconds
        name: Custom task name
    """
    def decorator(func: Callable[..., Awaitable[Any]]):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            queue = await get_task_queue()
            task_id = await queue.submit_task(
                func,
                *args,
                name=name,
                priority=priority,
                max_retries=max_retries,
                timeout=timeout,
                **kwargs
            )
            return task_id
        return wrapper
    return decorator


async def submit_background_task(
    func: Callable[..., Awaitable[Any]],
    *args,
    **kwargs
) -> UUID:
    """Submit a function as a background task."""
    queue = await get_task_queue()
    return await queue.submit_task(func, *args, **kwargs)


async def wait_for_background_task(task_id: UUID, timeout: Optional[float] = None) -> Any:
    """Wait for background task to complete and return result."""
    queue = await get_task_queue()
    result = await queue.wait_for_task(task_id, timeout)
    
    if result.status == TaskStatus.COMPLETED:
        return result.result
    elif result.status == TaskStatus.FAILED:
        raise TaskError(f"Task failed: {result.error}")
    elif result.status == TaskStatus.CANCELLED:
        raise TaskError("Task was cancelled")
    else:
        raise TaskError(f"Task in unexpected state: {result.status}")


async def shutdown_task_queue():
    """Shutdown the global task queue."""
    global _task_queue
    if _task_queue:
        await _task_queue.stop()
        _task_queue = None
