module.exports = function (context) {
    context.res = {
        status: 200,
        body: "pong"
    };
    context.done();
}; 