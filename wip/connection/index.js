const { connect } = require('net');
const { connect: connectTLS } = require('tls');
const { Observable, of } = require('rxjs');
const { mergeMap } = require('rxjs/operators');
const { always, unary, ifElse } = require('ramda');

const secureConnection = (socket) =>
  Observable.create((observer) => {
    const tlsSocket = connectTLS({ socket }, () => observer.next(tlsSocket));

    tlsSocket.once('error', (e) => observer.error(e));
    tlsSocket.once('end', () => observer.complete());

    return () => tlsSocket.destroy();
  });

const createConnection = ({ host, port, secure = false }) =>
  Observable.create((observer) => {
    const thePort = port || (secure ? 8729 : 8728);

    if (!host) {
      observer.error(new Error('host is required'));
      return null;
    }
    const socket = connect({ host, thePort }, () => {
      observer.next(socket);
    });

    socket.once('error', (e) => observer.error(e));
    socket.once('end', () => observer.complete());

    return () => socket.destroy();
  }).pipe(mergeMap(unary(ifElse(always(secure), secureConnection, unary(of)))));

module.exports = {
  createConnection,
};
