import {AnimationController} from '@ionic/angular';

const animationCtrl = new AnimationController();

export const getIonPageElement = (element: HTMLElement) => {
  if (element.classList.contains('ion-page')) {
    return element;
  }

  const ionPage = element.querySelector(
    ':scope > .ion-page, :scope > ion-nav, :scope > ion-tabs'
  );
  if (ionPage) {
    return ionPage;
  }
  // idk, return the original element so at least something animates and we don't have a null pointer
  return element;
};

export const defaultAnimation = (_: HTMLElement, opts: any) => {
  // create root transition
  const rootTransition = animationCtrl.create().duration(opts.duration || 500).easing('cubic-bezier(0.7,0,0.3,1)');

  const enterTransition = animationCtrl.create().addElement(opts.enteringEl);
  const exitTransition = animationCtrl.create().addElement(opts.leavingEl);

  enterTransition.fromTo('opacity', '0', '1');
  exitTransition.fromTo('opacity', '1', '0');

  rootTransition.addAnimation([enterTransition, exitTransition]);
  return rootTransition;
};
