import DDTRace from 'dd-trace';

let tracer;
if (process.env.DD_TRACE_ENABLED === 'true') {
  tracer = DDTRace.init({
    logInjection: true,
  }); // initialized in a different file to avoid hoisting.
}

export default tracer;
