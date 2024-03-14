const apiKey = process.env.NEXT_PUBLIC_API_KEY?process.env.NEXT_PUBLIC_API_KEY:"";
const kongAddress = process.env.NEXT_PUBLIC_KONG_ADDRESS?process.env.NEXT_PUBLIC_KONG_ADDRESS:"";
const doomWebKeyID = process.env.NEXT_PUBLIC_DOOM_WEB_KEY_ID?process.env.NEXT_PUBLIC_DOOM_WEB_KEY_ID:"";


const shared = {
  apiKey,
  kongAddress,
  doomWebKeyID,
};

export default shared;
