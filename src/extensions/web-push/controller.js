import { PushClient } from './lib'
import Emitter from 'component-emitter';

export class PushController {

  constructor(tracker) {

    this.tracker = tracker
    this._pushClient = new PushClient(
      this._stateChangeListener,
      this._subscriptionUpdate,
      // window.gauntface.CONSTANTS.APPLICATION_KEYS.publicKey
    );
    window.rst_push = this
  }

  _stateChangeListener(state, data) {
    console.log('state', state)
    switch (state.id) {
      case 'UNSUPPORTED':
        this.showErrorMessage(
          'Push Not Supported',
          data
        );
        break;
      case 'ERROR':
        this.showErrorMessage(
          'Ooops a Problem Occurred',
          data
        );
        break;
      default:
        break;
    }
  }

  _subscriptionUpdate(subscription) {
    this._currentSubscription = subscription;
    console.log('new sub', subscription)
    if (!subscription) {
      return;
    }
  }

  subscribe() {
    this._pushClient.subscribeDevice();
  }

  unsubscribe() {
    this._pushClient.unsubscribeDevice();
  }

  run() {
    if (!navigator.serviceWorker) {
      console.warn('Service worker not supported.');
      return;
    }
    if (!('PushManager' in window)) {
      console.warn('Push not supported.');
      return;
    }
    appController.registerServiceWorker();
  }

  showErrorMessage(title, message) {
    console.warn(title, message);
  }

  registerServiceWorker() {
    // Check that service workers are supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .catch((err) => {
          this.showErrorMessage(
            'Unable to Register SW',
            'Sorry this demo requires a service worker to work and it ' +
            'failed to install - sorry :('
          );
          console.error(err);
        });
    } else {
      this.showErrorMessage(
        'Service Worker Not Supported',
        'Sorry this demo requires service worker support in your browser. ' +
        'Please try this demo in Chrome or Firefox Nightly.'
      );
    }
  }
}
