
const Influx = require('influxdb-nodejs');
const client = new Influx('http://192.168.0.55:8086/testdb');
// i --> integer
// s --> string
// f --> float
// b --> boolean
const fieldSchema = {
  use: 'i',
  bytes: 'i',
  url: 's',
};
const tagSchema = {
  spdy: ['speedy', 'fast', 'slow'],
  method: '*',
  // http stats code: 10x, 20x, 30x, 40x, 50x
  type: ['1', '2', '3', '4', '5'],
};
client.schema('http', fieldSchema, tagSchema, {
  // default is false
  stripUnknown: true,
});
client.write('http')
  .tag({
    spdy: 'fast',
    method: 'GET',
    type: '2',  
  })
  .field({
    use: 300,
    bytes: 2312,
    url: 'https://localhost:4431/influx',
  })
  .then(() => console.info('write point success'))
  .catch(console.error);


