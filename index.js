const { createConnection } = require('net');
const split = require('binary-split');

const { commandToDeviceSentence } = require('./api/command/mappers');
const { toDeviceWord } = require('./api/command/mappers');

const command = {
  endpoint: '/login',
  attributes: {
    name: 'admin',
    password: 'M15lopm825lop!',
  },
  tag: 'login',
};

// const c1 = Buffer.concat([
//   toDeviceWord('/interface/lte/info'),
//   toDeviceWord('.tag=12'),
//   toDeviceWord('=number=0'),
//   // toDeviceWord('=once'),
//   toDeviceWord('=interval=1'),
//   toDeviceWord('=.proplist=rssi,rsrp,rsrq,sinr,session-uptime,registration-status'),
//   // toDeviceWord('=interval=2'),
//   Buffer.of(0),
// ]);

const c1 = Buffer.concat([
  // toDeviceWord('/tool/torch'),
  toDeviceWord('/interface/monitor-traffic'),
  toDeviceWord('.tag=22'),
  // toDeviceWord('=interfaces=lte1'),
  // toDeviceWord('=once'),
  toDeviceWord('=interval=5'),
  // toDeviceWord('=.proplist=rssi,rsrp,rsrq,sinr,session-uptime,registration-status'),
  // toDeviceWord('=interval=2'),
  Buffer.of(0),
]);

const b = commandToDeviceSentence(command);
let sent = false;

const conn = createConnection(
  {
    host: '192.168.42.10',
    port: 8728,
  },
  () => {
    conn.write(b);
  }
);

conn.pipe(split('\0')).on('data', (d) => {
  if (!sent) {
    sent = true;
    conn.write(c1);
  }
  if (sent) {
    console.log(JSON.stringify(d));
    console.log(d.toString());
  }
});
conn.on('error', (e) => console.error(e));

// console.log(b.toString());
