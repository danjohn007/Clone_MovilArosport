import URL from "../../Helper/URL";

const Peticiones = async (props) => {
  const { url, urlFull, method, data, token } = props;
  const urlFinal = urlFull ? urlFull : URL.BASE_URL + url;

  const requestHeaders =
    token == null || typeof token === "undefined"
      ? {}
      : {
          Authorization: token,
        };

  const options = {
    method: method,
    body: data,
    headers: requestHeaders,
  };
  //console.log("URL: ", urlFinal, "  Options: ", options);
  console.log("URL: ", urlFinal);

  try {
    const res = await fetch(urlFinal, options);
    if (!res) return null;
    const resultado = await res.json();
    return resultado;
  } catch (e) {
    console.log("url:", urlFinal, " error", e);
  }
};
export default Peticiones;