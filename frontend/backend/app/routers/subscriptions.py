"""
Subscription management routes with Stripe integration
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import stripe
from datetime import datetime

from ..db.database import get_db
from ..models.user import User, Subscription
from ..schemas.user import (
    SubscriptionDetails, SubscriptionCreate, SubscriptionUpdate,
    SubscriptionTier
)
from ..routers.auth import get_verified_user
from ..core.config import settings

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.get("/tiers", response_model=List[SubscriptionTier])
async def get_subscription_tiers():
    """Get available subscription tiers"""
    return [
        SubscriptionTier(**tier_data) 
        for tier_data in settings.SUBSCRIPTION_TIERS.values()
    ]


@router.get("/current", response_model=SubscriptionDetails)
async def get_current_subscription(
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db)
):
    """Get user's current subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        # Return free tier as default
        return SubscriptionDetails(
            id=0,
            tier="free",
            status="active",
            current_period_start=None,
            current_period_end=None,
            cancel_at_period_end=False,
            created_at=current_user.created_at
        )
    
    return subscription


@router.post("/create", response_model=SubscriptionDetails, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    # Validate tier
    if subscription_data.tier not in settings.SUBSCRIPTION_TIERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription tier"
        )
    
    # Check if user already has an active subscription
    existing_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )
    
    # Free tier doesn't require Stripe
    if subscription_data.tier == "free":
        current_user.subscription_tier = "free"
        db.commit()
        return SubscriptionDetails(
            id=0,
            tier="free",
            status="active",
            current_period_start=None,
            current_period_end=None,
            cancel_at_period_end=False,
            created_at=datetime.utcnow()
        )
    
    try:
        # Get price ID for the tier (you'd set these up in Stripe dashboard)
        price_ids = {
            "pro": "price_pro_monthly",  # Replace with actual Stripe price IDs
            "enterprise": "price_enterprise_monthly"
        }
        
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            subscription_data.payment_method_id,
            customer=current_user.stripe_customer_id
        )
        
        # Set as default payment method
        stripe.Customer.modify(
            current_user.stripe_customer_id,
            invoice_settings={
                "default_payment_method": subscription_data.payment_method_id
            }
        )
        
        # Create Stripe subscription
        stripe_subscription = stripe.Subscription.create(
            customer=current_user.stripe_customer_id,
            items=[{
                "price": price_ids[subscription_data.tier]
            }],
            expand=["latest_invoice.payment_intent"]
        )
        
        # Create subscription record
        subscription = Subscription(
            user_id=current_user.id,
            stripe_subscription_id=stripe_subscription.id,
            stripe_price_id=price_ids[subscription_data.tier],
            tier=subscription_data.tier,
            status=stripe_subscription.status,
            current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
            current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end)
        )
        
        # Update user's subscription tier
        current_user.subscription_tier = subscription_data.tier
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        return subscription
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.patch("/update", response_model=SubscriptionDetails)
async def update_subscription(
    update_data: SubscriptionUpdate,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db)
):
    """Update existing subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    try:
        # Handle tier change
        if update_data.tier and update_data.tier != subscription.tier:
            if update_data.tier not in settings.SUBSCRIPTION_TIERS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid subscription tier"
                )
            
            price_ids = {
                "pro": "price_pro_monthly",
                "enterprise": "price_enterprise_monthly"
            }
            
            # Update Stripe subscription
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    "id": stripe.Subscription.retrieve(subscription.stripe_subscription_id).items.data[0].id,
                    "price": price_ids[update_data.tier]
                }],
                proration_behavior="create_prorations"
            )
            
            subscription.tier = update_data.tier
            subscription.stripe_price_id = price_ids[update_data.tier]
            current_user.subscription_tier = update_data.tier
        
        # Handle cancellation
        if update_data.cancel_at_period_end is not None:
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=update_data.cancel_at_period_end
            )
            subscription.cancel_at_period_end = update_data.cancel_at_period_end
        
        db.commit()
        db.refresh(subscription)
        
        return subscription
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.delete("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db)
):
    """Cancel subscription immediately"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    try:
        # Cancel Stripe subscription
        stripe.Subscription.delete(subscription.stripe_subscription_id)
        
        # Update subscription status
        subscription.status = "canceled"
        current_user.subscription_tier = "free"
        
        db.commit()
        
        return {"message": "Subscription canceled successfully"}
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "invoice.payment_succeeded":
        subscription_data = event["data"]["object"]
        # Update subscription status
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data["subscription"]
        ).first()
        if subscription:
            subscription.status = "active"
            db.commit()
    
    elif event["type"] == "invoice.payment_failed":
        subscription_data = event["data"]["object"]
        # Handle failed payment
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data["subscription"]
        ).first()
        if subscription:
            # Mark as past due or cancel based on your business logic
            subscription.status = "past_due"
            db.commit()
    
    elif event["type"] == "customer.subscription.deleted":
        subscription_data = event["data"]["object"]
        # Handle subscription cancellation
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data["id"]
        ).first()
        if subscription:
            subscription.status = "canceled"
            subscription.user.subscription_tier = "free"
            db.commit()
    
    return {"status": "success"}
