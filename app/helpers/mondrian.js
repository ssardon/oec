import {Client as MondrianClient} from "mondrian-rest-client";

const CUBE_API = "http://oec-sandbox.datawheel.us/";
const client = new MondrianClient(CUBE_API);

export default client;
