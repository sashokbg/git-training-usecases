import {Subject} from "rxjs";


export const messageChannel$ = new Subject();

const handleMessage = (messageEvent) => {
  messageChannel$.next(messageEvent);
}

window.addEventListener('message', handleMessage);
