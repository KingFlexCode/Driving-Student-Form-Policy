exports.handler = async () => {
  console.log('ping hit at', new Date().toISOString());
  return { statusCode: 200, body: 'pong' };
};
