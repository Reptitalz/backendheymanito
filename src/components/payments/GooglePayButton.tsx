'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
    name: string;
    price: number;
    priceString: string;
    description: string;
}

interface GooglePayButtonProps {
    plan: Plan;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ plan }) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Only run this logic in the browser AND if it's in a top-level context (not an iframe)
        if (typeof window === 'undefined' || window.self !== window.top) {
            console.warn("Google Pay button not rendered: not in a top-level browsing context.");
            return;
        }

        if (!(window as any).google || !(window as any).google.payments) {
            console.warn("Google Pay script not loaded.");
            return;
        }

        const googlePayClient = new (window as any).google.payments.api.PaymentsClient({
            environment: 'TEST', // Use 'PRODUCTION' in production
        });

        const allowedPaymentMethods = ['CARD', 'TOKENIZED_CARD'];
        const baseCardPaymentMethod = {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
        };

        const tokenizedCardPaymentMethod = {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'stripe',
                    'stripe:version': '2020-08-27',
                    'stripe:publishableKey': 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY', // Replace with your actual Stripe key
                },
            },
        };
        
        const paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [baseCardPaymentMethod, tokenizedCardPaymentMethod],
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: plan.price.toFixed(2),
                currencyCode: 'MXN',
                countryCode: 'MX',
            },
            merchantInfo: {
                merchantName: 'Hey Manito!',
                merchantId: '01234567890123456789', // Replace with your Google Pay Merchant ID
            },
        };

        try {
            googlePayClient.isReadyToPay({
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [baseCardPaymentMethod],
            }).then((response: { result: any; }) => {
                if (response.result && buttonRef.current) {
                    const button = googlePayClient.createButton({
                        onClick: () => {
                            googlePayClient.loadPaymentData(paymentDataRequest)
                                .then((paymentData: any) => {
                                    // This is where you would process the payment on your backend
                                    // For now, we'll just simulate success
                                    console.log('Payment data:', paymentData);
                                    toast({
                                        title: "¡Pago Exitoso!",
                                        description: `Has comprado el ${plan.name}. Los créditos se añadirán a tu cuenta.`,
                                    });
                                })
                                .catch((err: any) => {
                                    console.error('Error loading payment data:', err);
                                    toast({
                                        variant: 'destructive',
                                        title: 'Error en el Pago',
                                        description: 'No se pudo completar la transacción. Por favor, inténtalo de nuevo.',
                                    });
                                });
                        },
                        buttonColor: 'default',
                        buttonType: 'buy', 
                        buttonSizeMode: 'fill',
                    });
                    buttonRef.current.appendChild(button);
                }
            }).catch((err: any) => {
                console.error('Google Pay isReadyToPay check failed:', err);
            });
        } catch (err) {
             console.error('Error initializing Google Pay button. This can happen in non-secure or iframe contexts:', err);
        }

        // Cleanup function
        return () => {
            if (buttonRef.current) {
                buttonRef.current.innerHTML = '';
            }
        };
    }, [plan, toast]);

    return <div ref={buttonRef} className="w-full"></div>;
};

export default GooglePayButton;
