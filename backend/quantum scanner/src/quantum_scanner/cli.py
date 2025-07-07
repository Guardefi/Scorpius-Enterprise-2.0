"""Command Line Interface for the Quantum Security Platform."""

import asyncio
import sys
from pathlib import Path
from typing import List, Optional
import json
import click

from .core.config import settings
from .core.logging import get_logger
from .services.cbom_engine.models import Asset, AssetType, CBOMConfig
from .services.cbom_engine.scanner import QuantumCBOMScanner
from .services.quantum_agility_tester.scanner import QuantumAgilityTester
from .services.quantum_agility_tester.models import AgilityScanRequest, TestType
from .services.attack_simulator.simulator import AttackSimulator
from .services.attack_simulator.models import SimulationRequest, AttackType

logger = get_logger(__name__)


@click.group()
@click.version_option(version="1.0.0")
def main():
    """Quantum Security Platform CLI - Enterprise Quantum-Ready Vulnerability Scanner."""
    pass


@main.group()
def cbom():
    """CBOM Engine commands for cryptographic bill of materials generation."""
    pass


@cbom.command()
@click.option('--target', '-t', required=True, help='Target to scan (file, directory, or URL)')
@click.option('--type', '-T', 'asset_type', 
              type=click.Choice(['source_code', 'binary', 'container', 'certificate']),
              default='source_code', help='Type of asset to scan')
@click.option('--output', '-o', help='Output file path for CBOM report')
@click.option('--format', '-f', 'output_format', 
              type=click.Choice(['json', 'cyclonedx']),
              default='json', help='Output format')
@click.option('--deep-scan/--no-deep-scan', default=True, help='Enable deep scanning')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def scan(target: str, asset_type: str, output: Optional[str], output_format: str, 
         deep_scan: bool, quiet: bool):
    """Scan target for cryptographic components and generate CBOM."""
    
    if not quiet:
        click.echo(f"🔍 Starting CBOM scan of {target}")
        click.echo(f"📊 Asset type: {asset_type}")
        click.echo(f"⚙️  Deep scan: {'enabled' if deep_scan else 'disabled'}")
    
    try:
        # Validate target exists
        if asset_type in ['source_code', 'binary', 'certificate']:
            target_path = Path(target)
            if not target_path.exists():
                click.echo(f"❌ Error: Target path does not exist: {target}", err=True)
                sys.exit(1)
        
        # Create asset object
        asset = Asset(
            name=Path(target).name if asset_type != 'container' else target,
            type=AssetType(asset_type),
            location=target
        )
        
        # Configure scanner
        config = CBOMConfig(
            deep_scan=deep_scan,
            output_format=output_format,
            quantum_assessment=True,
            fips_validation=True
        )
        
        # Run scan
        result = asyncio.run(_run_cbom_scan([asset], config, quiet))
        
        # Handle output
        if output:
            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            if output_format == 'json':
                with open(output_path, 'w') as f:
                    json.dump(result.dict(), f, indent=2, default=str)
            else:
                # CycloneDX export would go here
                click.echo("❌ CycloneDX export not yet implemented", err=True)
                sys.exit(1)
            
            if not quiet:
                click.echo(f"📄 Report saved to: {output_path}")
        else:
            # Print summary to console
            _print_cbom_summary(result, quiet)
    
    except Exception as e:
        click.echo(f"❌ Scan failed: {str(e)}", err=True)
        sys.exit(1)


@cbom.command()
@click.option('--targets-file', '-f', required=True, 
              help='JSON file containing list of targets to scan')
@click.option('--output-dir', '-o', help='Output directory for reports')
@click.option('--concurrent', '-c', default=3, help='Number of concurrent scans')
def batch_scan(targets_file: str, output_dir: Optional[str], concurrent: int):
    """Perform batch scanning of multiple targets."""
    
    try:
        # Load targets
        targets_path = Path(targets_file)
        if not targets_path.exists():
            click.echo(f"❌ Targets file not found: {targets_file}", err=True)
            sys.exit(1)
        
        with open(targets_path) as f:
            targets_data = json.load(f)
        
        assets = []
        for target_data in targets_data:
            asset = Asset(**target_data)
            assets.append(asset)
        
        click.echo(f"🔍 Starting batch scan of {len(assets)} targets")
        click.echo(f"⚡ Concurrent scans: {concurrent}")
        
        # Run batch scan
        config = CBOMConfig(deep_scan=True, quantum_assessment=True)
        result = asyncio.run(_run_cbom_scan(assets, config, False))
        
        # Save result
        if output_dir:
            output_path = Path(output_dir) / "batch_cbom_report.json"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            
            click.echo(f"📄 Batch report saved to: {output_path}")
        
        _print_cbom_summary(result, False)
    
    except Exception as e:
        click.echo(f"❌ Batch scan failed: {str(e)}", err=True)
        sys.exit(1)


@main.command()
@click.option('--host', default='127.0.0.1', help='Host to bind to')
@click.option('--port', default=8000, help='Port to bind to')
@click.option('--workers', default=1, help='Number of worker processes')
@click.option('--reload', is_flag=True, help='Enable auto-reload for development')
def serve(host: str, port: int, workers: int, reload: bool):
    """Start the Quantum Security Platform API server."""
    
    click.echo("🚀 Starting Quantum Security Platform API server")
    click.echo(f"🌐 Server will be available at: http://{host}:{port}")
    click.echo(f"📚 API documentation: http://{host}:{port}/docs")
    
    try:
        import uvicorn
        
        uvicorn.run(
            "quantum_scanner.app:app",
            host=host,
            port=port,
            workers=workers if not reload else 1,
            reload=reload,
            log_level="info" if not settings.debug else "debug",
        )
    
    except ImportError:
        click.echo("❌ uvicorn not installed. Install with: pip install uvicorn", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"❌ Server failed to start: {str(e)}", err=True)
        sys.exit(1)


@main.command()
def version():
    """Show version information."""
    click.echo(f"Quantum Security Platform v{settings.version}")
    click.echo(f"Environment: {settings.environment}")
    click.echo(f"Debug mode: {settings.debug}")


@main.command()
@click.option('--target', '-t', required=True, help='Target to scan (file, directory, or URL)')
@click.option('--output', '-o', help='Output file path for Agility report')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def agility_scan(target: str, output: Optional[str], quiet: bool):
    """Scan target for quantum agility and migration readiness."""
    
    if not quiet:
        click.echo(f"🔍 Starting Quantum Agility scan of {target}")
    
    try:
        # Validate target exists
        target_path = Path(target)
        if not target_path.exists():
            click.echo(f"❌ Error: Target path does not exist: {target}", err=True)
            sys.exit(1)
        
        # Create scan request
        scan_request = AgilityScanRequest(
            target=target,
            output=output,
            test_type=TestType.COMPREHENSIVE
        )
        
        # Run agility scan
        result = QuantumAgilityTester().run_scan(scan_request)
        
        # Handle output
        if output:
            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            
            click.echo(f"📄 Agility report saved to: {output_path}")
        else:
            # Print summary to console
            _print_agility_summary(result, quiet)
    
    except Exception as e:
        click.echo(f"❌ Agility scan failed: {str(e)}", err=True)
        sys.exit(1)


@main.command()
@click.option('--target', '-t', required=True, help='Target to simulate attack on (file, directory, or URL)')
@click.option('--attack-type', '-a', 
              type=click.Choice(['ransomware', 'data_exfiltration', 'insider_threat']),
              help='Type of attack to simulate')
@click.option('--output', '-o', help='Output file path for simulation report')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def attack_simulate(target: str, attack_type: Optional[str], output: Optional[str], quiet: bool):
    """Simulate a cyber attack on the target to test defenses."""
    
    if not quiet:
        click.echo(f"🔍 Starting attack simulation on {target}")
        click.echo(f"🎯 Attack type: {attack_type if attack_type else 'all'}")
    
    try:
        # Validate target exists
        target_path = Path(target)
        if not target_path.exists():
            click.echo(f"❌ Error: Target path does not exist: {target}", err=True)
            sys.exit(1)
        
        # Create simulation request
        simulation_request = SimulationRequest(
            target=target,
            attack_type=AttackType(attack_type) if attack_type else None
        )
        
        # Run attack simulation
        result = AttackSimulator().run_simulation(simulation_request)
        
        # Handle output
        if output:
            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            
            click.echo(f"📄 Simulation report saved to: {output_path}")
        else:
            # Print summary to console
            _print_simulation_summary(result, quiet)
    
    except Exception as e:
        click.echo(f"❌ Attack simulation failed: {str(e)}", err=True)
        sys.exit(1)


@main.group()
def agility():
    """Quantum Agility Tester commands for PQC migration performance testing."""
    pass


@agility.command()
@click.option('--system', '-s', multiple=True, required=True, help='Target systems to test')
@click.option('--algorithm', '-a', multiple=True, help='Specific algorithms to test')
@click.option('--test-type', '-t', multiple=True, 
              type=click.Choice(['throughput', 'latency', 'memory_usage', 'cpu_usage']),
              help='Types of performance tests to run')
@click.option('--include-migration/--no-migration', default=True, 
              help='Include migration performance tests')
@click.option('--output', '-o', help='Output file path for results')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode')
def test(system: tuple, algorithm: tuple, test_type: tuple, include_migration: bool, 
         output: Optional[str], quiet: bool):
    """Run quantum agility performance tests."""
    
    if not quiet:
        click.echo(f"🚀 Starting quantum agility tests")
        click.echo(f"🎯 Target systems: {', '.join(system)}")
        if algorithm:
            click.echo(f"🔐 Testing algorithms: {', '.join(algorithm)}")
        click.echo(f"🔄 Migration tests: {'enabled' if include_migration else 'disabled'}")
    
    try:
        # Convert test types
        test_types = [TestType(t) for t in test_type] if test_type else []
        
        # Create scan request
        request = AgilityScanRequest(
            target_systems=list(system),
            algorithms_to_test=list(algorithm) if algorithm else [],
            test_types=test_types,
            include_migration_tests=include_migration
        )
        
        # Run agility test
        result = asyncio.run(_run_agility_test(request, quiet))
        
        # Handle output
        if output:
            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            
            if not quiet:
                click.echo(f"📄 Results saved to {output_path}")
        else:
            if not quiet:
                _display_agility_results(result)
                
    except Exception as e:
        click.echo(f"❌ Agility test failed: {str(e)}", err=True)
        sys.exit(1)


@main.group()
def attack():
    """Attack Simulator commands for quantum threat assessment."""
    pass


@attack.command()
@click.option('--algorithm', '-a', multiple=True, required=True, 
              help='Algorithms to simulate attacks against')
@click.option('--key-size', '-k', multiple=True, type=int, 
              help='Key sizes to test')
@click.option('--attack-type', '-t', multiple=True,
              type=click.Choice(['shors_algorithm', 'grovers_algorithm']),
              help='Types of quantum attacks to simulate')
@click.option('--include-timeline/--no-timeline', default=True,
              help='Include threat timeline estimates')
@click.option('--confidence', '-c', type=float, default=0.95,
              help='Confidence level for estimates (0.0-1.0)')
@click.option('--output', '-o', help='Output file path for simulation report')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode')
def simulate(algorithm: tuple, key_size: tuple, attack_type: tuple, include_timeline: bool,
             confidence: float, output: Optional[str], quiet: bool):
    """Simulate quantum attacks against cryptographic algorithms."""
    
    if not quiet:
        click.echo(f"⚡ Starting quantum attack simulation")
        click.echo(f"🔐 Target algorithms: {', '.join(algorithm)}")
        if key_size:
            click.echo(f"🔑 Key sizes: {', '.join(map(str, key_size))}")
        if attack_type:
            click.echo(f"💥 Attack types: {', '.join(attack_type)}")
    
    try:
        # Convert attack types
        attack_types = [AttackType(t) for t in attack_type] if attack_type else []
        
        # Create simulation request
        request = SimulationRequest(
            target_algorithms=list(algorithm),
            key_sizes=list(key_size) if key_size else [],
            attack_types=attack_types,
            include_timeline=include_timeline,
            confidence_level=confidence
        )
        
        # Run simulation
        result = asyncio.run(_run_attack_simulation(request, quiet))
        
        # Handle output
        if output:
            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            
            if not quiet:
                click.echo(f"📄 Simulation report saved to {output_path}")
        else:
            if not quiet:
                _display_simulation_results(result)
                
    except Exception as e:
        click.echo(f"❌ Attack simulation failed: {str(e)}", err=True)
        sys.exit(1)


@main.command()
@click.option('--target', '-t', required=True, help='Target to scan')
@click.option('--comprehensive/--quick', default=False, help='Comprehensive or quick scan')
@click.option('--output-dir', '-o', help='Output directory for all reports')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode')
def full_scan(target: str, comprehensive: bool, output_dir: Optional[str], quiet: bool):
    """Run comprehensive quantum security assessment."""
    
    if not quiet:
        click.echo("🔮 Starting comprehensive quantum security assessment")
        click.echo(f"🎯 Target: {target}")
        click.echo(f"📊 Mode: {'comprehensive' if comprehensive else 'quick'}")
    
    try:
        # Set up output directory
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
        else:
            output_path = Path(f"quantum_scan_{target.replace('/', '_')}")
            output_path.mkdir(parents=True, exist_ok=True)
        
        # Run all scans
        results = asyncio.run(_run_full_assessment(target, comprehensive, quiet))
        
        # Save all results
        for scan_type, result in results.items():
            result_file = output_path / f"{scan_type}_results.json"
            with open(result_file, 'w') as f:
                json.dump(result.dict() if hasattr(result, 'dict') else result, 
                         f, indent=2, default=str)
        
        # Generate summary report
        summary_file = output_path / "executive_summary.json"
        summary = _generate_executive_summary(results)
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        if not quiet:
            click.echo(f"📊 Assessment complete! Results saved to {output_path}")
            _display_executive_summary(summary)
            
    except Exception as e:
        click.echo(f"❌ Full scan failed: {str(e)}", err=True)
        sys.exit(1)


@main.group()
def key_audit():
    """Key Audit commands for HSM/KMS quantum readiness assessment."""
    pass


@key_audit.command()
@click.option('--target', '-t', required=True, help='Key store target (name or identifier)')
@click.option('--type', '-T', 'store_type',
              type=click.Choice(['hsm', 'kms', 'software', 'cloud_hsm', 'hardware_token']),
              default='hsm', help='Type of key store')
@click.option('--depth', '-d',
              type=click.Choice(['basic', 'standard', 'comprehensive']),
              default='standard', help='Audit depth')
@click.option('--performance/--no-performance', default=False, help='Include performance benchmarking')
@click.option('--output', '-o', help='Output file path for audit report')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def audit(target: str, store_type: str, depth: str, performance: bool, output: Optional[str], quiet: bool):
    """Perform quantum readiness audit of key store."""
    
    if not quiet:
        click.echo(f"🔐 Starting key store audit: {target}")
        click.echo(f"📊 Store type: {store_type}")
        click.echo(f"🔍 Audit depth: {depth}")
        if performance:
            click.echo("⚡ Performance benchmarking: enabled")
    
    try:
        from .services.key_audit.scanner import KeyAuditScanner
        from .services.key_audit.models import KeyAuditRequest, KeyStoreType, FirmwareTarget
        
        # Create request
        key_store = FirmwareTarget(
            name=target,
            type=KeyStoreType(store_type),
            vendor="Unknown",
            model="Unknown"
        )
        
        request = KeyAuditRequest(
            target=key_store,
            store_type=KeyStoreType(store_type),
            scan_depth=depth,
            include_performance=performance
        )
        
        # Run audit
        scanner = KeyAuditScanner()
        result = asyncio.run(scanner.audit_key_store(request))
        
        if not quiet:
            click.echo(f"✅ Audit completed!")
            click.echo(f"🎯 Quantum readiness: {result.quantum_readiness}")
            click.echo(f"⚠️  Vulnerabilities found: {len(result.vulnerabilities)}")
            click.echo(f"💡 Recommendations: {len(result.migration_recommendations)}")
        
        # Save output
        if output:
            with open(output, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            if not quiet:
                click.echo(f"📄 Report saved to: {output}")
        else:
            click.echo(json.dumps(result.dict(), indent=2, default=str))
            
    except Exception as e:
        click.echo(f"❌ Audit failed: {str(e)}", err=True)
        sys.exit(1)


@main.group()
def firmware():
    """Firmware Scanner commands for IoT/embedded device analysis."""
    pass


@firmware.command()
@click.option('--target', '-t', required=True, help='Device or firmware target')
@click.option('--device-type', '-d',
              type=click.Choice(['iot_device', 'router', 'switch', 'camera', 'sensor', 'gateway']),
              default='iot_device', help='Type of device')
@click.option('--ip', help='IP address for network scanning')
@click.option('--firmware-path', '-f', help='Path to firmware binary')
@click.option('--depth', type=click.Choice(['quick', 'standard', 'comprehensive']),
              default='standard', help='Scan depth')
@click.option('--output', '-o', help='Output file path for scan report')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def scan(target: str, device_type: str, ip: Optional[str], firmware_path: Optional[str],
         depth: str, output: Optional[str], quiet: bool):
    """Scan IoT device or firmware for cryptographic vulnerabilities."""
    
    if not quiet:
        click.echo(f"🔌 Starting firmware scan: {target}")
        click.echo(f"📱 Device type: {device_type}")
        click.echo(f"🔍 Scan depth: {depth}")
    
    try:
        from .services.firmware_scanner.scanner import FirmwareScanner
        from .services.firmware_scanner.models import (
            FirmwareScanRequest, FirmwareTarget, DeviceType, ScanMethod
        )
        
        # Create target
        firmware_target = FirmwareTarget(
            name=target,
            device_type=DeviceType(device_type),
            vendor="Unknown",
            model="Unknown",
            ip_address=ip,
            firmware_path=firmware_path
        )
        
        # Configure scan methods
        scan_methods = [ScanMethod.STATIC_ANALYSIS]
        if ip:
            scan_methods.append(ScanMethod.NETWORK_SCAN)
        if firmware_path:
            scan_methods.append(ScanMethod.BINARY_ANALYSIS)
        
        request = FirmwareScanRequest(
            target=firmware_target,
            scan_methods=scan_methods,
            scan_depth=depth,
            include_network_scan=bool(ip),
            include_binary_analysis=bool(firmware_path)
        )
        
        # Run scan
        scanner = FirmwareScanner()
        result = asyncio.run(scanner.scan_firmware(request))
        
        if not quiet:
            click.echo(f"✅ Scan completed!")
            click.echo(f"🎯 Risk score: {result.quantum_risk_score:.1f}/10")
            click.echo(f"🔒 Crypto implementations: {len(result.crypto_implementations)}")
            click.echo(f"⚠️  Vulnerabilities: {len(result.vulnerabilities)}")
        
        # Save output
        if output:
            with open(output, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            if not quiet:
                click.echo(f"📄 Report saved to: {output}")
        else:
            click.echo(json.dumps(result.dict(), indent=2, default=str))
            
    except Exception as e:
        click.echo(f"❌ Scan failed: {str(e)}", err=True)
        sys.exit(1)


@main.group()
def compliance():
    """Compliance Mapper commands for regulatory framework assessment."""
    pass


@compliance.command()
@click.option('--organization', '-o', required=True, help='Organization name')
@click.option('--frameworks', '-f', multiple=True,
              type=click.Choice(['nist_csf', 'nist_800_53', 'fips_140', 'sox', 'hipaa', 'gdpr']),
              default=['nist_csf'], help='Compliance frameworks to assess')
@click.option('--scan-results', '-s', multiple=True, help='Scan result IDs to include')
@click.option('--scope', type=click.Choice(['basic', 'standard', 'comprehensive']),
              default='standard', help='Assessment scope')
@click.option('--output', help='Output file path for compliance report')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def assess(organization: str, frameworks: List[str], scan_results: List[str], 
           scope: str, output: Optional[str], quiet: bool):
    """Assess compliance against regulatory frameworks."""
    
    if not quiet:
        click.echo(f"📋 Starting compliance assessment for: {organization}")
        click.echo(f"📊 Frameworks: {', '.join(frameworks)}")
        click.echo(f"🔍 Scope: {scope}")
    
    try:
        from .services.compliance_mapper.mapper import ComplianceMapper
        from .services.compliance_mapper.models import (
            ComplianceMappingRequest, ComplianceFrameworkType
        )
        from uuid import uuid4
        
        # Convert frameworks to enum values
        framework_types = []
        for fw in frameworks:
            framework_types.append(ComplianceFrameworkType(fw))
        
        # Create dummy scan result IDs if none provided
        scan_result_ids = [uuid4() for _ in range(3)] if not scan_results else [uuid4()]
        
        request = ComplianceMappingRequest(
            organization=organization,
            frameworks=framework_types,
            scan_results=scan_result_ids,
            assessment_scope=scope
        )
        
        # Run assessment
        mapper = ComplianceMapper()
        result = asyncio.run(mapper.assess_compliance(request))
        
        if not quiet:
            click.echo(f"✅ Assessment completed!")
            click.echo(f"🎯 Overall compliance score: {result.overall_compliance_score:.1f}%")
            click.echo(f"📊 Frameworks assessed: {len(result.frameworks_assessed)}")
            click.echo(f"⚠️  Compliance gaps: {len(result.gap_analyses)}")
        
        # Save output
        if output:
            with open(output, 'w') as f:
                json.dump(result.dict(), f, indent=2, default=str)
            if not quiet:
                click.echo(f"📄 Report saved to: {output}")
        else:
            click.echo(json.dumps(result.dict(), indent=2, default=str))
            
    except Exception as e:
        click.echo(f"❌ Assessment failed: {str(e)}", err=True)
        sys.exit(1)


@main.group()
def dashboard():
    """Dashboard commands for executive risk visualization."""
    pass


@dashboard.command()
@click.option('--name', '-n', required=True, help='Dashboard name')
@click.option('--audience', '-a', 
              type=click.Choice(['executive', 'technical', 'operational']),
              default='executive', help='Target audience')
@click.option('--auto-refresh/--no-auto-refresh', default=True, help='Enable auto-refresh')
@click.option('--output', '-o', help='Output file for dashboard config')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def create(name: str, audience: str, auto_refresh: bool, output: Optional[str], quiet: bool):
    """Create a new executive dashboard configuration."""
    
    if not quiet:
        click.echo(f"📊 Creating dashboard: {name}")
        click.echo(f"👥 Target audience: {audience}")
        click.echo(f"🔄 Auto-refresh: {'enabled' if auto_refresh else 'disabled'}")
    
    try:
        from .services.dashboard.models import DashboardConfig, WidgetConfig, WidgetType
        from .services.dashboard.generator import DashboardGenerator
        
        # Create basic dashboard configuration
        config = DashboardConfig(
            name=name,
            description=f"{audience.title()} dashboard for quantum security monitoring",
            target_audience=audience,
            auto_refresh=auto_refresh,
            created_by="CLI User",
            widgets=[
                WidgetConfig(
                    title="Risk Overview",
                    widget_type=WidgetType.METRIC,
                    position={"x": 0, "y": 0, "width": 6, "height": 4},
                    data_source="risk_metrics"
                ),
                WidgetConfig(
                    title="Compliance Status",
                    widget_type=WidgetType.CHART,
                    position={"x": 6, "y": 0, "width": 6, "height": 4},
                    data_source="compliance_overview"
                )
            ]
        )
        
        if not quiet:
            click.echo(f"✅ Dashboard configuration created!")
            click.echo(f"🆔 Dashboard ID: {config.id}")
            click.echo(f"📊 Widgets configured: {len(config.widgets)}")
        
        # Save output
        if output:
            with open(output, 'w') as f:
                json.dump(config.dict(), f, indent=2, default=str)
            if not quiet:
                click.echo(f"📄 Configuration saved to: {output}")
        else:
            click.echo(json.dumps(config.dict(), indent=2, default=str))
            
    except Exception as e:
        click.echo(f"❌ Dashboard creation failed: {str(e)}", err=True)
        sys.exit(1)


@dashboard.command()
@click.option('--dashboard-id', '-d', required=True, help='Dashboard ID to generate data for')
@click.option('--output', '-o', help='Output file for dashboard data')
@click.option('--quiet', '-q', is_flag=True, help='Quiet mode - minimal output')
def generate_data(dashboard_id: str, output: Optional[str], quiet: bool):
    """Generate data for an existing dashboard."""
    
    if not quiet:
        click.echo(f"📊 Generating dashboard data for: {dashboard_id}")
    
    try:
        from .services.dashboard.generator import DashboardGenerator
        from .services.dashboard.models import DashboardConfig
        from uuid import UUID
        
        # Create a basic config for demo
        config = DashboardConfig(
            id=UUID(dashboard_id) if dashboard_id != "demo" else None,
            name="Demo Dashboard",
            description="Demo dashboard for CLI testing",
            target_audience="executive",
            created_by="CLI User"
        )
        
        # Generate data
        generator = DashboardGenerator()
        data = asyncio.run(generator.generate_dashboard_data(config))
        
        if not quiet:
            click.echo(f"✅ Dashboard data generated!")
            click.echo(f"🎯 Overall risk score: {data.executive_summary.overall_risk_score.value}")
            click.echo(f"🔒 Assets scanned: {data.executive_summary.assets_scanned.value}")
            click.echo(f"⚠️  Active alerts: {len(data.alerts)}")
        
        # Save output
        if output:
            with open(output, 'w') as f:
                json.dump(data.dict(), f, indent=2, default=str)
            if not quiet:
                click.echo(f"📄 Data saved to: {output}")
        else:
            click.echo(json.dumps(data.dict(), indent=2, default=str))
            
    except Exception as e:
        click.echo(f"❌ Data generation failed: {str(e)}", err=True)
        sys.exit(1)
```
