import axios from "axios";

const url = "http://localhost:9090/url";

export const getPresigned = async () => {
  try {
    const res = await axios.get(url);
    return res;
  } catch (error) {
    console.log("error on getting Presigned URL");
    return error;
  }
};
