const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { channel } = require("diagnostics_channel");
const dotenv = require('dotenv');
const fs = require('fs');
const portAudio = require('naudiodon');

const PROTO_PATH = "./proto/audio.proto";
dotenv.config();

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const audioProto = grpc.loadPackageDefinition(packageDefinition);

const stub = new audioProto.AudioService(`localhost:${process.env.SERVER_PORT}`, grpc.credentials.createInsecure());

const nombre_archivo = 'anyma.wav';

streamAudio(stub, nombre_archivo);

function streamAudio(stub, nombre_archivo) {
    var ao = new portAudio.AudioIO({
        outOptions: {
            channelCount: 2,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 48000
        }
    })
    ao.start();

    console.log((`\nReproduciendo el archivo: ${nombre_archivo}`))
    stub.downloadAudio({
        nombre: nombre_archivo
    }).on('data', (DataChunkResponse) => {
        process.stdout.write('.')
        ao.write(DataChunkResponse.data)
    }).on('end', function () {
        console.log('\nRecepcion de datos correcta.')
    })
}