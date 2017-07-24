var genesisCoinbaseTransactionTxid = "5f7e779f7600f54e528686e91d5891f3ae226ee907f461692519e549105f521c";
var genesisCoinbaseTransaction = {
	"hex": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0e04afeda3520102062f503253482fffffffff01004023ef3806000023210338bf57d51a50184cf5ef0dc42ecd519fb19e24574c057620262cc1df94da2ae5ac00000000",
	"txid": "5f7e779f7600f54e528686e91d5891f3ae226ee907f461692519e549105f521c",
	"hash": "5f7e779f7600f54e528686e91d5891f3ae226ee907f461692519e549105f521c",
	"size": 190,
	"vsize": 190,
	"version": 1,
	"confirmations":1811896,
	"vin": [
		{
			"coinbase": "04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73",
			"sequence": 1417875456
		}
	],
	"vout": [
		{
			"value": 68416.00000000,
			"n": 0,
			"scriptPubKey": {
				"asm": "0338bf57d51a50184cf5ef0dc42ecd519fb19e24574c057620262cc1df94da2ae5 OP_CHECKSIG",
				"hex": "210338bf57d51a50184cf5ef0dc42ecd519fb19e24574c057620262cc1df94da2ae5ac",
				"reqSigs": 1,
				"type": "pubkey",
				"addresses": [
					"DLAznsPDLDRgsVcTFWRMYMG5uH6GddDtv8"
				]
			}
		}
	],
	"blockhash": "82bc68038f6034c0596b6e313729793a887fded6e92a31fbdf70863f89d9bea2",
	"time": 1386474927,
	"blocktime": 1386474927
};

function getInfo() {
	return new Promise(function(resolve, reject) {
		client.cmd('getinfo', function(err, result, resHeaders) {
			if (err) {
				return console.log("Error 3207fh0f: " + err);
			}

			resolve(result);
		});
	});
}

function getBlockByHeight(blockHeight) {
	console.log("getBlockByHeight: " + blockHeight);

	return new Promise(function(resolve, reject) {
		var client = global.client;
		
		client.cmd('getblockhash', blockHeight, function(err, result, resHeaders) {
			if (err) {
				return console.log("Error 0928317yr3w: " + err);
			}

			client.cmd('getblock', result, function(err2, result2, resHeaders2) {
				if (err2) {
					return console.log("Error 320fh7e0hg: " + err2);
				}

				resolve({ success:true, getblockhash:result, getblock:result2 });
			});
		});
	});
}

function getBlocksByHeight(blockHeights) {
	console.log("getBlocksByHeight: " + blockHeights);

	return new Promise(function(resolve, reject) {
		var batch = [];
		for (var i = 0; i < blockHeights.length; i++) {
			batch.push({
				method: 'getblockhash',
				params: [ blockHeights[i] ]
			});
		}

		var blockHashes = [];
		client.cmd(batch, function(err, result, resHeaders) {
			blockHashes.push(result);

			if (blockHashes.length == batch.length) {
				var batch2 = [];
				for (var i = 0; i < blockHashes.length; i++) {
					batch2.push({
						method: 'getblock',
						params: [ blockHashes[i] ]
					});
				}

				var blocks = [];
				client.cmd(batch2, function(err2, result2, resHeaders2) {
					if (err2) {
						console.log("Error 138ryweufdf: " + err2);
					}

					blocks.push(result2);
					if (blocks.length == batch2.length) {
						resolve(blocks);
					}
				});
			}
		});
	});
}

function getBlockByHash(blockHash) {
	console.log("getBlockByHash: " + blockHash);

	return new Promise(function(resolve, reject) {
		var client = global.client;
		
		client.cmd('getblock', blockHash, function(err, result, resHeaders) {
			if (err) {
				console.log("Error 0u2fgewue: " + err);
			}

			resolve(result);
		});
	});
}

function getTransactionInputs(rpcClient, transaction) {
	console.log("getTransactionInputs: " + transaction.txid);

	return new Promise(function(resolve, reject) {
		var txids = [];
		for (var i = 0; i < transaction.vin.length; i++) {
			txids.push(transaction.vin[i].txid);
		}

		getRawTransactions(txids).then(function(inputTransactions) {
			resolve({ txid:transaction.txid, inputTransactions:inputTransactions });
		});
	});
}

function getRawTransaction(txid) {
	return new Promise(function(resolve, reject) {
		if (txid == genesisCoinbaseTransactionTxid) {
			getBlockByHeight(0).then(function(blockZeroResult) {
				var result = genesisCoinbaseTransaction;
				result.confirmations = blockZeroResult.getblock.confirmations;

				resolve(result);
			});
			
			return;
		}

		client.cmd('getrawtransaction', txid, 1, function(err, result, resHeaders) {
			if (err) {
				console.log("Error 329813yre823: " + err);
			}

			resolve(result);
		});
	});
}

function getRawTransactions(txids) {
	console.log("getRawTransactions: " + txids);

	return new Promise(function(resolve, reject) {
		if (!txids || txids.length == 0) {
			resolve([]);

			return;
		}

		if (txids.length == 1 && txids[0] == "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b") {
			// copy the "confirmations" field from genesis block to the genesis-coinbase tx
			getBlockByHeight(0).then(function(blockZeroResult) {
				var result = genesisCoinbaseTransaction;
				result.confirmations = blockZeroResult.getblock.confirmations;

				resolve([result]);
			});

			return;
		}

		var batch = [];
		for (var i = 0; i < txids.length; i++) {
			var txid = txids[i];

			batch.push({
				method: 'getrawtransaction',
				params: [ txid, 1 ]
			});
		}

		var results = [];

		var count = batch.length;
		client.cmd(batch, function(err, result, resHeaders) {
			if (err) {
				console.log("Error 10238rhwefyhd: " + err);
			}

			results.push(result);

			count--;

			if (count == 0) {
				resolve(results);
			}
		});
	});
}

function getBlockData(rpcClient, blockHash, txLimit, txOffset) {
	console.log("getBlockData: " + blockHash);

	return new Promise(function(resolve, reject) {
		client.cmd('getblock', blockHash, function(err2, result2, resHeaders2) {
			if (err2) {
				console.log("Error 3017hfwe0f: " + err2);

				reject(err2);

				return;
			}

			var txids = [];
			for (var i = txOffset; i < Math.min(txOffset + txLimit, result2.tx.length); i++) {
				txids.push(result2.tx[i]);
			}

			getRawTransactions(txids).then(function(transactions) {
				var txInputsByTransaction = {};

				var promises = [];
				for (var i = 0; i < transactions.length; i++) {
					var transaction = transactions[i];

					if (transaction) {
						promises.push(getTransactionInputs(client, transaction));
					}
				}

				Promise.all(promises).then(function() {
					var results = arguments[0];
					for (var i = 0; i < results.length; i++) {
						var resultX = results[i];

						txInputsByTransaction[resultX.txid] = resultX.inputTransactions;
					}

					resolve({ getblock:result2, transactions:transactions, txInputsByTransaction:txInputsByTransaction });
				});
			});
		});
	});
}

module.exports = {
	getInfo: getInfo,
	getBlockByHeight: getBlockByHeight,
	getBlocksByHeight: getBlocksByHeight,
	getBlockByHash: getBlockByHash,
	getTransactionInputs: getTransactionInputs,
	getBlockData: getBlockData,
	getRawTransaction: getRawTransaction,
	getRawTransactions: getRawTransactions
};
