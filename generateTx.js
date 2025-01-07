const { dag4 } = require("@stardust-collective/dag4");
const jsSha256 = require("js-sha256");
const axios = require("axios");

// Command line arguments

const generateProof = async (message, walletPrivateKey, account) => {
  // Sort object by keys
  const sortObjectByKey = (sourceObject) => {
    if (Array.isArray(sourceObject)) {
      return sourceObject.map(sortObjectByKey);
    } else if (typeof sourceObject === "object" && sourceObject !== null) {
      return Object.keys(sourceObject)
        .sort()
        .reduce((sortedObj, key) => {
          const value = sourceObject[key];
          sortedObj[key] = sortObjectByKey(value);
          return sortedObj;
        }, {});
    } else {
      return sourceObject;
    }
  };

  // Recursively remove nulls
  const removeNulls = (obj) => {
    if (Array.isArray(obj)) {
      return obj
        .filter((v) => v !== null)
        .map((v) => (v && typeof v === "object" ? removeNulls(v) : v));
    } else if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([, v]) => v !== null)
          .map(([k, v]) => [k, v && typeof v === "object" ? removeNulls(v) : v])
      );
    } else {
      return obj;
    }
  };

  const getEncoded = (value) => {
    let nonNullValue = removeNulls(value);
    let sortedValue = sortObjectByKey(nonNullValue);
    return JSON.stringify(sortedValue);
  };

  const serialize = (data) => {
    return Buffer.from(data, "utf8");
  };

  const encoded = getEncoded(message);
  const serialized = serialize(encoded);
  const hash = jsSha256.sha256(serialized);

  console.log(`\nMessage (JSON): ${encoded}`);
  console.log(`\nHash: ${hash}`);

  const signature = await dag4.keyStore.sign(walletPrivateKey, hash);

  const publicKey = account.publicKey;
  const uncompressedPublicKey =
    publicKey.length === 128 ? "04" + publicKey : publicKey;

  return {
    id: uncompressedPublicKey.substring(2),
    signature,
  };
};

const sendDataTransactionsUsingUrls = async (
  globalL0Url,
  metagraphL1DataUrl,
  userId
) => {
  const generateWallet = () => {
    const privateKey = dag4.keyStore.generatePrivateKey();
    const account = dag4.createAccount();
    // account.loginPrivateKey("a9c5299a9a1e679adfd26d62a8a51da73dfebaa1bc43e7c8912a4ad11e746393");
    account.loginPrivateKey(privateKey);
    account.connect({
      networkVersion: "2.0",
      l0Url: globalL0Url,
      testnet: true,
    });

    // console.log(`{"address": "${account.address}", "privateKey": "${privateKey}" }`);
    return { account, privateKey };
  };

  const { account, privateKey } = generateWallet();
  const now = new Date();
  const oneDayInMillis = 1 * 1.5 * 60 * 60 * 1000;
  const message = {
    CreateTask: {
      description: "This is a task description",
      userId,
      token: "_",
      dueDate: (now.getTime() + oneDayInMillis).toString(),
      optStatus: {
        type: "InProgress",
      },
    },
  };
  const proof = await generateProof(message, privateKey, account);
  const body = {
    value: {
      ...message,
    },
    proofs: [proof],
  };
  try {
    console.log(`\nTransaction body: ${JSON.stringify(body)}`);
    const response = await axios.post(`${metagraphL1DataUrl}/data`, body);
    console.log(`\nResponse: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (e) {
    console.log(
      "\nError sending transaction",
      e.response ? e.response.data : e.message
    );
  }
  return null;
};

const sendDataTransaction = async (userId) => {
  const globalL0Url = "http://3.146.146.202:9000";
  const metagraphL1DataUrl = "http://3.146.146.202:9400";

  return await sendDataTransactionsUsingUrls(globalL0Url, metagraphL1DataUrl, userId);
};

module.exports = { sendDataTransaction };
