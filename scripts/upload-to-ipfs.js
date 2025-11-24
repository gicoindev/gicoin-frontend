// CommonJS
const { Web3Storage, getFilesFromPath } = require('web3.storage');
require('dotenv').config();

async function main () {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) throw new Error('WEB3_STORAGE_TOKEN not set');

  const client = new Web3Storage({ token });

  // folder hasil `next export` default: ./out
  const files = await getFilesFromPath('./out');
  console.log(`Uploading ${files.length} files to web3.storage...`);

  const cid = await client.put(files, {
    name: `gicoin-dapp-${new Date().toISOString()}`,
    wrapWithDirectory: true
  });

  console.log('👉 CID:', cid);
  // optional: write CID to file so CI can pick it up
  const fs = require('fs');
  fs.writeFileSync('last-ipfs-cid.txt', cid);
  console.log('Saved CID to last-ipfs-cid.txt');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
