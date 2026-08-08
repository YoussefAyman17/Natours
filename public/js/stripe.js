import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Ty92w1HhyGBRGiCRACvC1ImJn1ilp81MhUnZjeKa0sixHt5TyB2EdMKPgk4hxka74fxkIloNuE1vjwywAozgBk700AYJKa9Fu',
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
