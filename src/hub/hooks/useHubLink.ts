// src/hub/hooks/useHubLink.ts
import { useRouter } from 'next/navigation';
import { HUB_ROUTES } from '../hub.constants';

export const useHubLink = () => {
  const router = useRouter();

  const linkToAddress = (address: string) => {
    // In a real app, this might set the wallet address in HubStore first
    router.push(HUB_ROUTES.WALLET);
  };

  const linkToTx = (txid: string) => {
    router.push(HUB_ROUTES.ROOT); // CommandCenter handles live feed
  };

  const linkToToken = (symbol: string) => {
    router.push(HUB_ROUTES.DEX);
  };

  return { linkToAddress, linkToTx, linkToToken };
};
