const { Reader } = require('monet');
const { Observable } = require('rxjs');
const { generate: generateChannelId } = require('short-uuid');
const { assocPath } = require('ramda');
const { weave } = require('ramda-adjunct');
const split = require('binary-split');
const { map } = require('rxjs/operators');

const createApiMessage$ = (socket) =>
  Observable.create((observer) => {
    const handleData = (data) => observer.next(data);

    const splitStream = socket.pipe(split('\0'));

    splitStream.on('data', handleData);

    return () => splitStream.removeListener(handleData);
  }).pipe(map());

const createContext = (socket) => ({
  apiMessages$: createApiMessage$(socket),
  pendingCommands: [],
});

const cancelCommand = (tag) => Reader(({ context, socket }) => {});

const requestCancelCommand = (tag) =>
  Reader((config) =>
    process.setImmediate(() => {
      cancelCommand(tag).run(config);
    })
  );

const issueCommand = (command) =>
  Reader(
    ({ context, socket }) =>
      new Observable((observer) => {
        const commandWithTag = assocPath(['tag'], generateChannelId(), command);

        return () =>
          requestCancelCommand(commandWithTag.tag).run({ context, socket });
      })
  );

const createClient = (socket) => {};

module.exports = {
  createClient,
};
