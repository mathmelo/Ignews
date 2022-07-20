import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-client';

import styles from './styles.module.scss';

interface ISubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: ISubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  async function handleSubscribe() {
    if(!session) {
      signIn('github');
      return;
    }

    if(session?.activeSubscription) {
      router.push('/posts');
      return;
    }

    try {
      const response = await api.post('/subscribe');

      const { sessionId } = response.data;

      const stripe = getStripeJs();

      (await stripe).redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err)
    }
  }

  return (
    <button 
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}