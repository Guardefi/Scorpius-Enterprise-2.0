/**
 * Subscription management API service for SCORPIUS frontend
 */
import { authAPI } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface SubscriptionTier {
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
}

export interface SubscriptionDetails {
  id: number;
  tier: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface CreateSubscriptionRequest {
  tier: string;
  payment_method_id: string;
}

export interface UpdateSubscriptionRequest {
  tier?: string;
  cancel_at_period_end?: boolean;
}

class SubscriptionsAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = authAPI.getAccessToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && {
          Authorization: `Bearer ${accessToken}`,
        }),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      console.error("Subscriptions API request failed:", error);
      throw error;
    }
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    return this.makeRequest<SubscriptionTier[]>("/subscriptions/tiers");
  }

  async getCurrentSubscription(): Promise<SubscriptionDetails> {
    return this.makeRequest<SubscriptionDetails>("/subscriptions/current");
  }

  async createSubscription(
    data: CreateSubscriptionRequest,
  ): Promise<SubscriptionDetails> {
    return this.makeRequest<SubscriptionDetails>("/subscriptions/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(
    data: UpdateSubscriptionRequest,
  ): Promise<SubscriptionDetails> {
    return this.makeRequest<SubscriptionDetails>("/subscriptions/update", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(): Promise<{ message: string }> {
    return this.makeRequest("/subscriptions/cancel", {
      method: "DELETE",
    });
  }

  // Stripe integration helpers
  async createPaymentMethod(
    stripe: any,
    cardElement: any,
    billingDetails: any,
  ): Promise<string> {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentMethod.id;
  }

  // Get tier information
  getTierInfo(
    tierName: string,
    tiers: SubscriptionTier[],
  ): SubscriptionTier | null {
    return (
      tiers.find(
        (tier) => tier.name.toLowerCase() === tierName.toLowerCase(),
      ) || null
    );
  }

  // Check if user has access to a feature based on their tier
  hasFeatureAccess(
    userTier: string,
    requiredTier: string,
    tiers: SubscriptionTier[],
  ): boolean {
    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userLevel =
      tierHierarchy[userTier as keyof typeof tierHierarchy] ?? -1;
    const requiredLevel =
      tierHierarchy[requiredTier as keyof typeof tierHierarchy] ?? 999;
    return userLevel >= requiredLevel;
  }

  // Format currency
  formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  // Calculate savings for annual billing
  calculateAnnualSavings(monthlyPrice: number): number {
    const annualPrice = monthlyPrice * 10; // 2 months free
    const monthlySavings = monthlyPrice * 12 - annualPrice;
    return monthlySavings;
  }
}

export const subscriptionsAPI = new SubscriptionsAPI();
