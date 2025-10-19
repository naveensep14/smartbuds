import { supabase } from './supabase';
import { SubscriptionPlan, UserSubscription, Payment } from '@/types';

export const subscriptionService = {
  // Get all active subscription plans
  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('grade', { ascending: true })
        .order('board', { ascending: true });

      if (error) throw error;

      return data?.map(plan => ({
        id: plan.id,
        name: plan.name,
        grade: plan.grade,
        board: plan.board,
        priceUsd: parseFloat(plan.price_usd),
        stripePriceId: plan.stripe_price_id,
        stripeProductId: plan.stripe_product_id,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at),
      })) || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  // Get plans by grade and board
  getPlansByGradeBoard: async (grade: string, board: string): Promise<SubscriptionPlan[]> => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('grade', grade)
        .eq('board', board)
        .eq('is_active', true);

      if (error) throw error;

      return data?.map(plan => ({
        id: plan.id,
        name: plan.name,
        grade: plan.grade,
        board: plan.board,
        priceUsd: parseFloat(plan.price_usd),
        stripePriceId: plan.stripe_price_id,
        stripeProductId: plan.stripe_product_id,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at),
      })) || [];
    } catch (error) {
      console.error('Error fetching plans by grade/board:', error);
      return [];
    }
  },

  // Get user's active subscription
  getUserSubscription: async (userId: string): Promise<UserSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            name,
            grade,
            board,
            price_usd,
            stripe_price_id,
            stripe_product_id,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No subscription found
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        planId: data.plan_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id,
        status: data.status,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        plan: data.subscription_plans ? {
          id: data.subscription_plans.id,
          name: data.subscription_plans.name,
          grade: data.subscription_plans.grade,
          board: data.subscription_plans.board,
          priceUsd: parseFloat(data.subscription_plans.price_usd),
          stripePriceId: data.subscription_plans.stripe_price_id,
          stripeProductId: data.subscription_plans.stripe_product_id,
          isActive: data.subscription_plans.is_active,
          createdAt: new Date(data.subscription_plans.created_at),
          updatedAt: new Date(data.subscription_plans.updated_at),
        } : undefined,
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  },

  // Check if user has access to specific grade/board
  hasAccess: async (userId: string, grade: string, board: string): Promise<boolean> => {
    try {
      const subscription = await subscriptionService.getUserSubscription(userId);
      
      if (!subscription) return false;
      
      // Check if subscription is active and not expired
      const now = new Date();
      if (subscription.status !== 'active' || subscription.currentPeriodEnd < now) {
        return false;
      }
      
      // Check if subscription covers the requested grade/board
      return subscription.plan?.grade === grade && subscription.plan?.board === board;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  },

  // Create new subscription
  createSubscription: async (subscriptionData: {
    userId: string;
    planId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }): Promise<UserSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: subscriptionData.userId,
          plan_id: subscriptionData.planId,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          current_period_start: subscriptionData.currentPeriodStart.toISOString(),
          current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        planId: data.plan_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id,
        status: data.status,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  },

  // Update subscription status
  updateSubscriptionStatus: async (
    stripeSubscriptionId: string, 
    status: string,
    currentPeriodEnd?: Date
  ): Promise<boolean> => {
    try {
      const updateData: any = { status };
      if (currentPeriodEnd) {
        updateData.current_period_end = currentPeriodEnd.toISOString();
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return false;
    }
  },

  // Create payment record
  createPayment: async (paymentData: {
    userId: string;
    subscriptionId: string;
    stripePaymentIntentId: string;
    amountUsd: number;
    status: string;
  }): Promise<Payment | null> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: paymentData.userId,
          subscription_id: paymentData.subscriptionId,
          stripe_payment_intent_id: paymentData.stripePaymentIntentId,
          amount_usd: paymentData.amountUsd,
          status: paymentData.status,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        subscriptionId: data.subscription_id,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        amountUsd: parseFloat(data.amount_usd),
        status: data.status,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  },
};
