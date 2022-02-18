// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/everscale-inpage-provider/dist/utils.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueId = exports.mergeTransactions = exports.AddressLiteral = exports.Address = void 0;
/**
 * @category Utils
 */
class Address {
    constructor(address) {
        this._address = address;
    }
    toString() {
        return this._address;
    }
    equals(other) {
        if (other instanceof Address) {
            return this._address == other._address;
        }
        else {
            return this._address == other;
        }
    }
}
exports.Address = Address;
/**
 * @category Utils
 */
class AddressLiteral extends Address {
    constructor(address) {
        super(address);
    }
}
exports.AddressLiteral = AddressLiteral;
/**
 * Modifies knownTransactions array, merging it with new transactions.
 * All arrays are assumed to be sorted by descending logical time.
 *
 * > Note! This method does not remove duplicates.
 *
 * @param knownTransactions
 * @param newTransactions
 * @param info
 *
 * @category Utils
 */
function mergeTransactions(knownTransactions, newTransactions, info) {
    if (info.batchType == 'old') {
        knownTransactions.push(...newTransactions);
        return knownTransactions;
    }
    if (knownTransactions.length === 0) {
        knownTransactions.push(...newTransactions);
        return knownTransactions;
    }
    // Example:
    // known lts: [N, N-1, N-2, N-3, (!) N-10,...]
    // new lts: [N-4, N-5]
    // batch info: { minLt: N-5, maxLt: N-4, batchType: 'new' }
    // 1. Skip indices until known transaction lt is greater than the biggest in the batch
    let i = 0;
    while (i < knownTransactions.length &&
        knownTransactions[i].id.lt.localeCompare(info.maxLt) >= 0) {
        ++i;
    }
    // 2. Insert new transactions
    knownTransactions.splice(i, 0, ...newTransactions);
    return knownTransactions;
}
exports.mergeTransactions = mergeTransactions;
const MAX = 4294967295;
let idCounter = Math.floor(Math.random() * MAX);
function getUniqueId() {
    idCounter = (idCounter + 1) % MAX;
    return idCounter;
}
exports.getUniqueId = getUniqueId;

},{}],"../node_modules/everscale-inpage-provider/dist/models.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTokensObject = exports.serializeTokensObject = exports.parseAccountInteraction = exports.parsePermissions = exports.parseMessage = exports.serializeMessage = exports.parseTransaction = exports.serializeTransaction = void 0;
const utils_1 = require("./utils");
/**
 * @category Models
 */
function serializeTransaction(transaction) {
    return {
        ...transaction,
        inMessage: serializeMessage(transaction.inMessage),
        outMessages: transaction.outMessages.map(serializeMessage),
    };
}
exports.serializeTransaction = serializeTransaction;
/**
 * @category Models
 */
function parseTransaction(transaction) {
    return {
        ...transaction,
        inMessage: parseMessage(transaction.inMessage),
        outMessages: transaction.outMessages.map(parseMessage),
    };
}
exports.parseTransaction = parseTransaction;
/**
 * @category Models
 */
function serializeMessage(message) {
    return {
        ...message,
        src: message.src ? message.src.toString() : undefined,
        dst: message.dst ? message.dst.toString() : undefined,
    };
}
exports.serializeMessage = serializeMessage;
/**
 * @category Models
 */
function parseMessage(message) {
    return {
        ...message,
        src: message.src ? new utils_1.Address(message.src) : undefined,
        dst: message.dst ? new utils_1.Address(message.dst) : undefined,
    };
}
exports.parseMessage = parseMessage;
/**
 * @category Models
 */
function parsePermissions(permissions) {
    return {
        ...permissions,
        accountInteraction: permissions.accountInteraction ? parseAccountInteraction(permissions.accountInteraction) : undefined,
    };
}
exports.parsePermissions = parsePermissions;
/**
 * @category Models
 */
function parseAccountInteraction(accountInteraction) {
    return {
        ...accountInteraction,
        address: new utils_1.Address(accountInteraction.address),
    };
}
exports.parseAccountInteraction = parseAccountInteraction;
/**
 * @category Models
 */
function serializeTokensObject(object) {
    return serializeTokenValue(object);
}
exports.serializeTokensObject = serializeTokensObject;
function serializeTokenValue(token) {
    if (token instanceof utils_1.Address) {
        return token.toString();
    }
    if (Array.isArray(token)) {
        const result = [];
        for (const item of token) {
            result.push(serializeTokenValue(item));
        }
        return result;
    }
    else if (token != null && typeof token === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(token)) {
            result[key] = serializeTokenValue(value);
        }
        return result;
    }
    else {
        return token;
    }
}
/**
 * @category Models
 */
function parseTokensObject(params, object) {
    const result = {};
    for (const param of params) {
        result[param.name] = parseTokenValue(param, object[param.name]);
    }
    return result;
}
exports.parseTokensObject = parseTokensObject;
function parseTokenValue(param, token) {
    if (!param.type.startsWith('map')) {
        const isArray = param.type.endsWith('[]');
        const isOptional = !isArray && param.type.startsWith('optional');
        const rawType = (isArray ?
            param.type.slice(0, -2) :
            isOptional ?
                param.type.slice(9, -1) :
                param.type);
        if (isArray) {
            const rawParam = { name: param.name, type: rawType, components: param.components };
            const result = [];
            for (const item of token) {
                result.push(parseTokenValue(rawParam, item));
            }
            return result;
        }
        else if (isOptional) {
            if (token == null) {
                return null;
            }
            else {
                const rawParam = { name: param.name, type: rawType, components: param.components };
                return parseTokenValue(rawParam, token);
            }
        }
        else if (rawType == 'tuple') {
            const result = {};
            if (param.components != null) {
                for (const component of param.components) {
                    result[component.name] = parseTokenValue(component, token[component.name]);
                }
            }
            return result;
        }
        else if (rawType == 'address') {
            return new utils_1.Address(token);
        }
        else {
            return token;
        }
    }
    else {
        let [keyType, valueType] = param.type.split(',');
        keyType = keyType.slice(4);
        valueType = valueType.slice(0, -1);
        const result = [];
        for (const [key, value] of token) {
            result.push([parseTokenValue({
                    name: '',
                    type: keyType,
                }, key), parseTokenValue({
                    name: '',
                    type: valueType,
                    components: param.components,
                }, value)]);
        }
        return result;
    }
}

},{"./utils":"../node_modules/everscale-inpage-provider/dist/utils.js"}],"../node_modules/everscale-inpage-provider/dist/stream.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriber = void 0;
const utils_1 = require("./utils");
/**
 * @category Stream
 */
class Subscriber {
    constructor(provider) {
        this.provider = provider;
        this.subscriptions = {};
        this.scanners = {};
    }
    /**
     * Returns stream of new transactions
     */
    transactions(address) {
        return this._addSubscription('transactionsFound', address);
    }
    /**
     * Returns stream of old transactions
     */
    oldTransactions(address, filter) {
        const id = (0, utils_1.getUniqueId)();
        return new StreamImpl(async (onData, onEnd) => {
            const scanner = new UnorderedTransactionsScanner(this.provider, {
                address,
                onData,
                onEnd,
                ...filter,
            });
            this.scanners[id] = scanner;
            await scanner.start();
        }, async () => {
            const scanner = this.scanners[id];
            delete this.scanners[id];
            if (scanner != null) {
                await scanner.stop();
            }
        }, identity);
    }
    states(address) {
        return this._addSubscription('contractStateChanged', address);
    }
    async unsubscribe() {
        const subscriptions = Object.assign({}, this.subscriptions);
        for (const address of Object.keys(this.subscriptions)) {
            delete this.subscriptions[address];
        }
        const scanners = Object.assign({}, this.scanners);
        for (const id of Object.keys(this.scanners)) {
            delete this.scanners[id];
        }
        await Promise.all(Object.values(subscriptions)
            .map(async (item) => {
            const events = Object.assign({}, item);
            for (const event of Object.keys(events)) {
                delete item[event];
            }
            await Promise.all(Object.values(events).map((eventData) => {
                if (eventData == null) {
                    return;
                }
                return eventData.subscription.then((item) => {
                    return item.unsubscribe();
                }).catch(() => {
                    // ignore
                });
            }));
        }).concat(Object.values(scanners).map((item) => item.stop())));
    }
    _addSubscription(event, address) {
        const id = (0, utils_1.getUniqueId)();
        return new StreamImpl((onData, onEnd) => {
            let subscriptions = this.subscriptions[address.toString()];
            let eventData = subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions[event];
            if (eventData == null) {
                const handlers = {
                    [id]: { onData, onEnd, queue: new PromiseQueue() },
                };
                eventData = {
                    subscription: this.provider.subscribe(event, {
                        address,
                    }).then((subscription) => {
                        subscription.on('data', (data) => {
                            Object.values(handlers).forEach(({ onData, queue }) => {
                                queue.enqueue(() => onData(data));
                            });
                        });
                        subscription.on('unsubscribed', () => {
                            Object.values(handlers).forEach(({ onEnd, queue }) => {
                                delete handlers[id];
                                queue.clear();
                                queue.enqueue(async () => onEnd());
                            });
                        });
                        return subscription;
                    }).catch((e) => {
                        console.error(e);
                        Object.values(handlers).forEach(({ onEnd, queue }) => {
                            delete handlers[id];
                            queue.clear();
                            queue.enqueue(() => onEnd());
                        });
                        throw e;
                    }),
                    handlers,
                };
                if (subscriptions == null) {
                    subscriptions = {
                        [event]: eventData,
                    };
                    this.subscriptions[address.toString()] = subscriptions;
                }
                else {
                    subscriptions[event] = eventData;
                }
            }
            else {
                eventData.handlers[id] = { onData, onEnd, queue: new PromiseQueue() };
            }
        }, () => {
            const subscriptions = this.subscriptions[address.toString()];
            if (subscriptions == null) {
                return;
            }
            const eventData = subscriptions[event];
            if (eventData != null) {
                delete eventData.handlers[id];
                if (Object.keys(eventData.handlers).length === 0) {
                    const subscription = eventData.subscription;
                    delete subscriptions[event];
                    subscription
                        .then((subscription) => subscription.unsubscribe())
                        .catch(console.debug);
                }
            }
            if (Object.keys(subscriptions).length === 0) {
                delete this.subscriptions[address.toString()];
            }
        }, identity);
    }
}
exports.Subscriber = Subscriber;
async function identity(event, handler) {
    await handler(event);
}
class StreamImpl {
    constructor(makeProducer, stopProducer, extractor) {
        this.makeProducer = makeProducer;
        this.stopProducer = stopProducer;
        this.extractor = extractor;
    }
    first() {
        return new Promise(async (resolve, reject) => {
            this.makeProducer(async (event) => {
                await this.extractor(event, (item) => {
                    this.stopProducer();
                    resolve(item);
                });
            }, () => reject(new Error('Subscription closed')));
        });
    }
    on(handler) {
        this.makeProducer(async (event) => {
            await this.extractor(event, handler);
        }, () => {
        });
    }
    merge(other) {
        return new StreamImpl(async (onEvent, onEnd) => {
            const state = {
                counter: 0,
            };
            const checkEnd = () => {
                if (++state.counter == 2) {
                    onEnd();
                }
            };
            this.makeProducer(onEvent, checkEnd);
            other.makeProducer(onEvent, checkEnd);
        }, () => {
            this.stopProducer();
            other.stopProducer();
        }, this.extractor);
    }
    filter(f) {
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            if (await f(item)) {
                await handler(item);
            }
        }));
    }
    filterMap(f) {
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            const newItem = await f(item);
            if (newItem !== undefined) {
                await handler(newItem);
            }
        }));
    }
    map(f) {
        return this.filterMap(f);
    }
    flatMap(f) {
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            const items = await f(item);
            for (const newItem of items) {
                await handler(newItem);
            }
        }));
    }
    skip(n) {
        const state = {
            index: 0,
        };
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            if (state.index >= n) {
                await handler(item);
            }
            else {
                ++state.index;
            }
        }));
    }
    skipWhile(f) {
        const state = {
            shouldSkip: true,
        };
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            if (!state.shouldSkip || !(await f(item))) {
                state.shouldSkip = false;
                await handler(item);
            }
        }));
    }
}
class UnorderedTransactionsScanner {
    constructor(provider, { address, onData, onEnd, fromLt, fromUtime, }) {
        this.provider = provider;
        this.queue = new PromiseQueue();
        this.isRunning = false;
        this.address = address;
        this.onData = onData;
        this.onEnd = onEnd;
        this.fromLt = fromLt;
        this.fromUtime = fromUtime;
    }
    async start() {
        if (this.isRunning || this.promise != null) {
            return;
        }
        this.isRunning = true;
        this.promise = (async () => {
            while (this.isRunning) {
                try {
                    const { transactions, continuation } = await this.provider.getTransactions({
                        address: this.address,
                        continuation: this.continuation,
                    });
                    if (!this.isRunning || transactions.length == null) {
                        break;
                    }
                    const filteredTransactions = transactions.filter((item) => ((this.fromLt == null || item.id.lt > this.fromLt) && ((this.fromUtime == null || item.createdAt > this.fromUtime))));
                    if (filteredTransactions.length == 0) {
                        break;
                    }
                    const info = {
                        maxLt: filteredTransactions[0].id.lt,
                        minLt: filteredTransactions[filteredTransactions.length - 1].id.lt,
                        batchType: 'old',
                    };
                    this.queue.enqueue(() => this.onData({
                        address: this.address,
                        transactions: filteredTransactions,
                        info,
                    }));
                    if (continuation != null) {
                        this.continuation = continuation;
                    }
                    else {
                        break;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            this.queue.enqueue(async () => this.onEnd());
            this.isRunning = false;
            this.continuation = undefined;
        })();
    }
    async stop() {
        this.isRunning = false;
        this.queue.clear();
        if (this.promise != null) {
            await this.promise;
        }
        else {
            this.onEnd();
        }
    }
}
class PromiseQueue {
    constructor() {
        this.queue = [];
        this.workingOnPromise = false;
    }
    enqueue(promise) {
        this.queue.push(promise);
        this._dequeue().catch(() => {
        });
    }
    clear() {
        this.queue.length = 0;
    }
    async _dequeue() {
        if (this.workingOnPromise) {
            return;
        }
        const item = this.queue.shift();
        if (!item) {
            return;
        }
        this.workingOnPromise = true;
        item()
            .then(() => {
            this.workingOnPromise = false;
            this._dequeue();
        })
            .catch(() => {
            this.workingOnPromise = false;
            this._dequeue();
        });
    }
}

},{"./utils":"../node_modules/everscale-inpage-provider/dist/utils.js"}],"../node_modules/everscale-inpage-provider/dist/contract.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TvmException = exports.Contract = void 0;
const models_1 = require("./models");
/**
 * @category Contract
 */
class Contract {
    constructor(provider, abi, address) {
        if (!Array.isArray(abi.functions)) {
            throw new Error('Invalid abi. Functions array required');
        }
        if (!Array.isArray(abi.events)) {
            throw new Error('Invalid abi. Events array required');
        }
        this._provider = provider;
        this._abi = JSON.stringify(abi);
        this._functions = abi.functions.reduce((functions, item) => {
            functions[item.name] = { inputs: item.inputs || [], outputs: item.outputs || [] };
            return functions;
        }, {});
        this._events = abi.events.reduce((events, item) => {
            events[item.name] = { inputs: item.inputs || [] };
            return events;
        }, {});
        this._address = address;
        class ContractMethodImpl {
            constructor(provider, functionAbi, abi, address, method, params) {
                this.provider = provider;
                this.functionAbi = functionAbi;
                this.abi = abi;
                this.address = address;
                this.method = method;
                this.params = (0, models_1.serializeTokensObject)(params);
            }
            async send(args) {
                const { transaction } = await this.provider.rawApi.sendMessage({
                    sender: args.from.toString(),
                    recipient: this.address.toString(),
                    amount: args.amount,
                    bounce: args.bounce == null ? true : args.bounce,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                });
                return (0, models_1.parseTransaction)(transaction);
            }
            async sendWithResult(args) {
                const subscriber = this.provider.createSubscriber();
                try {
                    // Parent transaction from wallet
                    let parentTransaction;
                    // Child transaction promise
                    let resolveChildTransactionPromise;
                    const childTransactionPromise = new Promise((resolve) => {
                        resolveChildTransactionPromise = (tx) => resolve(tx);
                    });
                    // Array for collecting transactions on target before parent transaction promise resolution
                    const possibleChildren = [];
                    // Subscribe to this account
                    subscriber.transactions(this.address)
                        .flatMap(batch => batch.transactions)
                        // Listen only messages from sender
                        .filter(item => { var _a; return ((_a = item.inMessage.src) === null || _a === void 0 ? void 0 : _a.equals(args.from)) || false; })
                        .on((tx) => {
                        if (parentTransaction == null) {
                            // If we don't known whether the message was sent just collect all transactions from the sender
                            possibleChildren.push(tx);
                        }
                        else if (parentTransaction.possibleMessages.findIndex((msg) => msg.hash == tx.inMessage.hash) >= 0) {
                            // Resolve promise if transaction was found
                            resolveChildTransactionPromise === null || resolveChildTransactionPromise === void 0 ? void 0 : resolveChildTransactionPromise(tx);
                        }
                    });
                    // Send message
                    const transaction = await this.send(args);
                    // Extract all outgoing messages from the parent transaction to this contract
                    const possibleMessages = transaction.outMessages.filter(msg => { var _a; return ((_a = msg.dst) === null || _a === void 0 ? void 0 : _a.equals(this.address)) || false; });
                    // Update stream state
                    parentTransaction = {
                        transaction,
                        possibleMessages,
                    };
                    // Check whether child transaction was already found
                    const alreadyReceived = possibleChildren.find((tx) => {
                        return possibleMessages.findIndex((msg) => msg.hash == tx.inMessage.hash) >= 0;
                    });
                    if (alreadyReceived != null) {
                        resolveChildTransactionPromise === null || resolveChildTransactionPromise === void 0 ? void 0 : resolveChildTransactionPromise(alreadyReceived);
                    }
                    const childTransaction = await childTransactionPromise;
                    // Parse output
                    let output = undefined;
                    try {
                        const result = await this.provider.rawApi.decodeTransaction({
                            transaction: (0, models_1.serializeTransaction)(childTransaction),
                            abi: this.abi,
                            method: this.method,
                        });
                        if (result != null) {
                            output = this.functionAbi.outputs != null
                                ? (0, models_1.parseTokensObject)(this.functionAbi.outputs, result.output)
                                : {};
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                    // Done
                    return {
                        parentTransaction: parentTransaction.transaction,
                        childTransaction,
                        output,
                    };
                }
                finally {
                    await subscriber.unsubscribe();
                }
            }
            async estimateFees(args) {
                const { fees } = await this.provider.rawApi.estimateFees({
                    sender: args.from.toString(),
                    recipient: this.address.toString(),
                    amount: args.amount,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                });
                return fees;
            }
            async sendExternal(args) {
                let method = args.withoutSignature === true
                    ? this.provider.rawApi.sendUnsignedExternalMessage
                    : this.provider.rawApi.sendExternalMessage;
                let { transaction, output } = await method({
                    publicKey: args.publicKey,
                    recipient: this.address.toString(),
                    stateInit: args.stateInit,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                    local: args.local,
                });
                return {
                    transaction: (0, models_1.parseTransaction)(transaction),
                    output: output != null ? (0, models_1.parseTokensObject)(this.functionAbi.outputs, output) : undefined,
                };
            }
            async call(args = {}) {
                let { output, code } = await this.provider.rawApi.runLocal({
                    address: this.address.toString(),
                    cachedState: args.cachedState,
                    responsible: args.responsible,
                    functionCall: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                });
                if (output == null || code != 0) {
                    throw new TvmException(code);
                }
                else {
                    return (0, models_1.parseTokensObject)(this.functionAbi.outputs, output);
                }
            }
        }
        this._methods = new Proxy({}, {
            get: (_object, method) => {
                const rawAbi = this._functions[method];
                return (params) => new ContractMethodImpl(this._provider, rawAbi, this._abi, this._address, method, params);
            },
        });
    }
    get methods() {
        return this._methods;
    }
    get address() {
        return this._address;
    }
    get abi() {
        return this._abi;
    }
    async decodeTransaction(args) {
        try {
            const result = await this._provider.rawApi.decodeTransaction({
                transaction: (0, models_1.serializeTransaction)(args.transaction),
                abi: this._abi,
                method: args.methods,
            });
            if (result == null) {
                return undefined;
            }
            let { method, input, output } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                input: rawAbi.inputs != null ? (0, models_1.parseTokensObject)(rawAbi.inputs, input) : {},
                output: rawAbi.outputs != null ? (0, models_1.parseTokensObject)(rawAbi.outputs, output) : {},
            };
        }
        catch (_) {
            return undefined;
        }
    }
    async decodeTransactionEvents(args) {
        try {
            const { events } = await this._provider.rawApi.decodeTransactionEvents({
                transaction: (0, models_1.serializeTransaction)(args.transaction),
                abi: this._abi,
            });
            const result = [];
            for (const { event, data } of events) {
                const rawAbi = this._events[event];
                result.push({
                    event,
                    data: rawAbi.inputs != null ? (0, models_1.parseTokensObject)(rawAbi.inputs, data) : {},
                });
            }
            return result;
        }
        catch (_) {
            return [];
        }
    }
    async decodeInputMessage(args) {
        try {
            const result = await this._provider.rawApi.decodeInput({
                abi: this._abi,
                body: args.body,
                internal: args.internal,
                method: args.methods,
            });
            if (result == null) {
                return undefined;
            }
            let { method, input } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                input: rawAbi.inputs != null ? (0, models_1.parseTokensObject)(rawAbi.inputs, input) : {},
            };
        }
        catch (_) {
            return undefined;
        }
    }
    async decodeOutputMessage(args) {
        try {
            const result = await this._provider.rawApi.decodeOutput({
                abi: this._abi,
                body: args.body,
                method: args.methods,
            });
            if (result == null) {
                return undefined;
            }
            let { method, output } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                output: rawAbi.outputs != null ? (0, models_1.parseTokensObject)(rawAbi.outputs, output) : {},
            };
        }
        catch (_) {
            return undefined;
        }
    }
}
exports.Contract = Contract;
/**
 * @category Contract
 */
class TvmException extends Error {
    constructor(code) {
        super(`TvmException: ${code}`);
        this.code = code;
    }
}
exports.TvmException = TvmException;

},{"./models":"../node_modules/everscale-inpage-provider/dist/models.js"}],"../node_modules/everscale-inpage-provider/dist/api.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],"../node_modules/everscale-inpage-provider/dist/index.js":[function(require,module,exports) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderNotInitializedException = exports.ProviderNotFoundException = exports.ProviderRpcClient = exports.hasEverscaleProvider = exports.mergeTransactions = exports.AddressLiteral = exports.Address = exports.Subscriber = void 0;
const models_1 = require("./models");
const utils_1 = require("./utils");
const subscriber = __importStar(require("./stream"));
const contract = __importStar(require("./contract"));
__exportStar(require("./api"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./contract"), exports);
var stream_1 = require("./stream");
Object.defineProperty(exports, "Subscriber", { enumerable: true, get: function () { return stream_1.Subscriber; } });
var utils_2 = require("./utils");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return utils_2.Address; } });
Object.defineProperty(exports, "AddressLiteral", { enumerable: true, get: function () { return utils_2.AddressLiteral; } });
Object.defineProperty(exports, "mergeTransactions", { enumerable: true, get: function () { return utils_2.mergeTransactions; } });
let ensurePageLoaded;
if (document.readyState == 'complete') {
    ensurePageLoaded = Promise.resolve();
}
else {
    ensurePageLoaded = new Promise((resolve) => {
        window.addEventListener('load', () => {
            resolve();
        });
    });
}
/**
 * @category Provider
 */
async function hasEverscaleProvider() {
    await ensurePageLoaded;
    return window.__hasEverscaleProvider === true;
}
exports.hasEverscaleProvider = hasEverscaleProvider;
/**
 * @category Provider
 */
class ProviderRpcClient {
    constructor(properties = {}) {
        this._subscriptions = {};
        this._contractSubscriptions = {};
        const self = this;
        // Create contract proxy type
        class ProviderContract extends contract.Contract {
            constructor(abi, address) {
                super(self, abi, address);
            }
        }
        this.Contract = ProviderContract;
        // Create subscriber proxy type
        class ProviderSubscriber extends subscriber.Subscriber {
            constructor() {
                super(self);
            }
        }
        this.Subscriber = ProviderSubscriber;
        this._properties = properties;
        // Wrap provider requests
        this._api = new Proxy({}, {
            get: (_object, method) => (params) => {
                if (this._provider != null) {
                    return this._provider.request({ method, params: params });
                }
                else {
                    throw new ProviderNotInitializedException();
                }
            },
        });
        // Initialize provider with injected object by default
        this._provider = window.__ever;
        if (this._provider != null) {
            // Provider as already injected
            this._mainInitializationPromise = Promise.resolve();
        }
        else {
            // Wait until page is loaded and initialization complete
            this._mainInitializationPromise = hasEverscaleProvider().then((hasProvider) => new Promise((resolve, reject) => {
                if (!hasProvider) {
                    // Fully loaded page doesn't even contain provider flag
                    reject(new ProviderNotFoundException());
                    return;
                }
                // Wait injected provider initialization otherwise
                this._provider = window.__ever;
                if (this._provider != null) {
                    resolve();
                }
                else {
                    window.addEventListener('ever#initialized', (_data) => {
                        this._provider = window.__ever;
                        resolve();
                    });
                }
            }));
        }
        // Will only register handlers for successfully loaded injected provider
        this._mainInitializationPromise.then(() => {
            if (this._provider != null) {
                this._registerEventHandlers(this._provider);
            }
        });
    }
    /**
     * Checks whether this page has injected Everscale provider
     */
    async hasProvider() {
        return hasEverscaleProvider();
    }
    /**
     * Waits until provider api will be available. Calls `fallback` if no provider was found
     *
     * @throws ProviderNotFoundException when no provider found
     */
    async ensureInitialized() {
        try {
            await this._mainInitializationPromise;
        }
        catch (e) {
            if (this._properties.fallback == null) {
                throw e;
            }
            if (this._additionalInitializationPromise == null) {
                this._additionalInitializationPromise = this._properties.fallback().then(async (provider) => {
                    this._provider = provider;
                    this._registerEventHandlers(this._provider);
                });
            }
            await this._additionalInitializationPromise;
        }
    }
    /**
     * Whether provider api is ready
     */
    get isInitialized() {
        return this._provider != null;
    }
    /**
     * Raw provider
     */
    get raw() {
        if (this._provider != null) {
            return this._provider;
        }
        else {
            throw new ProviderNotInitializedException();
        }
    }
    /**
     * Raw provider api
     */
    get rawApi() {
        return this._api;
    }
    /**
     * Creates typed contract wrapper.
     *
     * @param abi Readonly object (must be declared with `as const`)
     * @param address Default contract address
     *
     * @deprecated `new ever.Contract(abi, address)` should be used instead
     */
    createContract(abi, address) {
        return new this.Contract(abi, address);
    }
    /**
     * Creates subscriptions group
     *
     * @deprecated `new ever.Subscriber()` should be used instead
     */
    createSubscriber() {
        return new this.Subscriber();
    }
    /**
     * Requests new permissions for current origin.
     * Shows an approval window to the user.
     * Will overwrite already existing permissions
     *
     * ---
     * Required permissions: none
     */
    async requestPermissions(args) {
        const result = await this._api.requestPermissions({
            permissions: args.permissions,
        });
        return (0, models_1.parsePermissions)(result);
    }
    /**
     * Updates `accountInteraction` permission value
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async changeAccount() {
        await this._api.changeAccount();
    }
    /**
     * Removes all permissions for current origin and stops all subscriptions
     */
    async disconnect() {
        await this._api.disconnect();
    }
    async subscribe(eventName, params) {
        class SubscriptionImpl {
            constructor(_subscribe, _unsubscribe) {
                this._subscribe = _subscribe;
                this._unsubscribe = _unsubscribe;
                this._listeners = {
                    ['data']: [],
                    ['subscribed']: [],
                    ['unsubscribed']: [],
                };
            }
            on(eventName, listener) {
                this._listeners[eventName].push(listener);
                return this;
            }
            async subscribe() {
                await this._subscribe(this);
                for (const handler of this._listeners['subscribed']) {
                    handler();
                }
            }
            async unsubscribe() {
                await this._unsubscribe();
                for (const handler of this._listeners['unsubscribed']) {
                    handler();
                }
            }
            notify(data) {
                for (const handler of this._listeners['data']) {
                    handler(data);
                }
            }
        }
        let existingSubscriptions = this._getEventSubscriptions(eventName);
        const id = (0, utils_1.getUniqueId)();
        switch (eventName) {
            case 'connected':
            case 'disconnected':
            case 'networkChanged':
            case 'permissionsChanged':
            case 'loggedOut': {
                const subscription = new SubscriptionImpl(async (subscription) => {
                    if (existingSubscriptions[id] != null) {
                        return;
                    }
                    existingSubscriptions[id] = (data) => {
                        subscription.notify(data);
                    };
                }, async () => {
                    delete existingSubscriptions[id];
                });
                await subscription.subscribe();
                return subscription;
            }
            case 'transactionsFound':
            case 'contractStateChanged': {
                const address = params.address.toString();
                const subscription = new SubscriptionImpl(async (subscription) => {
                    if (existingSubscriptions[id] != null) {
                        return;
                    }
                    existingSubscriptions[id] = ((data) => {
                        if (data.address.toString() == address) {
                            subscription.notify(data);
                        }
                    });
                    let contractSubscriptions = this._contractSubscriptions[address];
                    if (contractSubscriptions == null) {
                        contractSubscriptions = {};
                        this._contractSubscriptions[address] = contractSubscriptions;
                    }
                    contractSubscriptions[id] = {
                        state: eventName == 'contractStateChanged',
                        transactions: eventName == 'transactionsFound',
                    };
                    const { total, withoutExcluded, } = foldSubscriptions(Object.values(contractSubscriptions), contractSubscriptions[id]);
                    try {
                        if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
                            await this.rawApi.subscribe({ address, subscriptions: total });
                        }
                    }
                    catch (e) {
                        delete existingSubscriptions[id];
                        delete contractSubscriptions[id];
                        throw e;
                    }
                }, async () => {
                    delete existingSubscriptions[id];
                    const contractSubscriptions = this._contractSubscriptions[address];
                    if (contractSubscriptions == null) {
                        return;
                    }
                    const updates = contractSubscriptions[id];
                    const { total, withoutExcluded } = foldSubscriptions(Object.values(contractSubscriptions), updates);
                    delete contractSubscriptions[id];
                    if (!withoutExcluded.transactions && !withoutExcluded.state) {
                        await this.rawApi.unsubscribe({ address });
                    }
                    else if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
                        await this.rawApi.subscribe({ address, subscriptions: withoutExcluded });
                    }
                });
                await subscription.subscribe();
                return subscription;
            }
            default: {
                throw new Error(`Unknown event ${eventName}`);
            }
        }
    }
    /**
     * Returns provider api state
     *
     * ---
     * Required permissions: none
     */
    async getProviderState() {
        const state = await this._api.getProviderState();
        return {
            ...state,
            permissions: (0, models_1.parsePermissions)(state.permissions),
        };
    }
    /**
     * Requests contract data
     *
     * ---
     * Required permissions: `basic`
     */
    async getFullContractState(args) {
        return await this._api.getFullContractState({
            address: args.address.toString(),
        });
    }
    /**
     * Requests accounts with specified code hash
     *
     * ---
     * Required permissions: `basic`
     */
    async getAccountsByCodeHash(args) {
        const { accounts, continuation } = await this._api.getAccountsByCodeHash({
            ...args,
        });
        return {
            accounts: accounts.map((address) => new utils_1.Address(address)),
            continuation,
        };
    }
    /**
     * Requests contract transactions
     *
     * ---
     * Required permissions: `basic`
     */
    async getTransactions(args) {
        const { transactions, continuation, info } = await this._api.getTransactions({
            ...args,
            address: args.address.toString(),
        });
        return {
            transactions: transactions.map(models_1.parseTransaction),
            continuation,
            info,
        };
    }
    /**
     * Searches transaction by hash
     *
     * ---
     * Required permissions: `basic`
     */
    async getTransaction(args) {
        const { transaction } = await this._api.getTransaction({
            ...args,
        });
        return {
            transaction: transaction ? (0, models_1.parseTransaction)(transaction) : undefined,
        };
    }
    /**
     * Calculates contract address from code and init params
     *
     * ---
     * Required permissions: `basic`
     */
    async getExpectedAddress(abi, args) {
        const { address } = await this._api.getExpectedAddress({
            abi: JSON.stringify(abi),
            ...args,
            initParams: (0, models_1.serializeTokensObject)(args.initParams),
        });
        return new utils_1.Address(address);
    }
    /**
     * Computes hash of base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    async getBocHash(boc) {
        return await this._api.getBocHash({
            boc,
        }).then(({ hash }) => hash);
    }
    /**
     * Creates base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    async packIntoCell(args) {
        return await this._api.packIntoCell({
            structure: args.structure,
            data: (0, models_1.serializeTokensObject)(args.data),
        });
    }
    /**
     * Decodes base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    async unpackFromCell(args) {
        const { data } = await this._api.unpackFromCell({
            ...args,
            structure: args.structure,
        });
        return {
            data: (0, models_1.parseTokensObject)(args.structure, data),
        };
    }
    /**
     * Extracts public key from raw account state
     *
     * **NOTE:** can only be used on contracts which are deployed and has `pubkey` header
     *
     * ---
     * Required permissions: `basic`
     */
    async extractPublicKey(boc) {
        const { publicKey } = await this._api.extractPublicKey({
            boc,
        });
        return publicKey;
    }
    /**
     * Converts base64 encoded contract code into tvc with default init data
     *
     * ---
     * Required permissions: `basic`
     */
    async codeToTvc(code) {
        const { tvc } = await this._api.codeToTvc({
            code,
        });
        return tvc;
    }
    /**
     * Splits base64 encoded state init into code and data
     *
     * ---
     * Required permissions: `basic`
     */
    async splitTvc(tvc) {
        return await this._api.splitTvc({
            tvc,
        });
    }
    /**
     * Adds asset to the selected account
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async addAsset(args) {
        let params;
        switch (args.type) {
            case 'tip3_token': {
                params = {
                    rootContract: args.params.rootContract.toString(),
                };
                break;
            }
            default:
                throw new Error('Unknown asset type');
        }
        return await this._api.addAsset({
            account: args.account.toString(),
            type: args.type,
            params,
        });
    }
    async verifySignature(args) {
        return await this._api.verifySignature(args);
    }
    /**
     * Signs arbitrary data.
     *
     * NOTE: hashes data before signing. Use `signDataRaw` to sign without hash.
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async signData(args) {
        return await this._api.signData(args);
    }
    /**
     * Signs arbitrary data without hashing it
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async signDataRaw(args) {
        return await this._api.signDataRaw(args);
    }
    /**
     * Encrypts arbitrary data with specified algorithm for each specified recipient
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async encryptData(args) {
        const { encryptedData } = await this._api.encryptData(args);
        return encryptedData;
    }
    /**
     * Decrypts encrypted data. Returns base64 encoded data
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async decryptData(encryptedData) {
        const { data } = await this._api.decryptData({ encryptedData });
        return data;
    }
    /**
     * Sends internal message from user account.
     * Shows an approval window to the user.
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    async sendMessage(args) {
        const { transaction } = await this._api.sendMessage({
            ...args,
            sender: args.sender.toString(),
            recipient: args.recipient.toString(),
            payload: args.payload ? ({
                abi: args.payload.abi,
                method: args.payload.method,
                params: (0, models_1.serializeTokensObject)(args.payload.params),
            }) : undefined,
        });
        return {
            transaction: (0, models_1.parseTransaction)(transaction),
        };
    }
    _registerEventHandlers(provider) {
        const knownEvents = {
            'connected': (data) => data,
            'disconnected': (data) => data,
            'transactionsFound': (data) => ({
                address: new utils_1.Address(data.address),
                transactions: data.transactions.map(models_1.parseTransaction),
                info: data.info,
            }),
            'contractStateChanged': (data) => ({
                address: new utils_1.Address(data.address),
                state: data.state,
            }),
            'networkChanged': data => data,
            'permissionsChanged': (data) => ({
                permissions: (0, models_1.parsePermissions)(data.permissions),
            }),
            'loggedOut': data => data,
        };
        for (const [eventName, extractor] of Object.entries(knownEvents)) {
            provider.addListener(eventName, (data) => {
                const handlers = this._subscriptions[eventName];
                if (handlers == null) {
                    return;
                }
                const parsed = extractor(data);
                for (const handler of Object.values(handlers)) {
                    handler(parsed);
                }
            });
        }
    }
    _getEventSubscriptions(eventName) {
        let existingSubscriptions = this._subscriptions[eventName];
        if (existingSubscriptions == null) {
            existingSubscriptions = {};
            this._subscriptions[eventName] = existingSubscriptions;
        }
        return existingSubscriptions;
    }
}
exports.ProviderRpcClient = ProviderRpcClient;
/**
 * @category Provider
 */
class ProviderNotFoundException extends Error {
    constructor() {
        super('Everscale provider was not found');
    }
}
exports.ProviderNotFoundException = ProviderNotFoundException;
/**
 * @category Provider
 */
class ProviderNotInitializedException extends Error {
    constructor() {
        super('Everscale provider was not initialized yet');
    }
}
exports.ProviderNotInitializedException = ProviderNotInitializedException;
function foldSubscriptions(subscriptions, except) {
    const total = { state: false, transactions: false };
    const withoutExcluded = Object.assign({}, total);
    for (const item of subscriptions) {
        if (withoutExcluded.transactions && withoutExcluded.state) {
            break;
        }
        total.state || (total.state = item.state);
        total.transactions || (total.transactions = item.transactions);
        if (item != except) {
            withoutExcluded.state || (withoutExcluded.state = item.state);
            withoutExcluded.transactions || (withoutExcluded.transactions = item.transactions);
        }
    }
    return { total, withoutExcluded };
}

},{"./models":"../node_modules/everscale-inpage-provider/dist/models.js","./utils":"../node_modules/everscale-inpage-provider/dist/utils.js","./stream":"../node_modules/everscale-inpage-provider/dist/stream.js","./contract":"../node_modules/everscale-inpage-provider/dist/contract.js","./api":"../node_modules/everscale-inpage-provider/dist/api.js"}],"../build/App.abi.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  "ABI version": 2,
  "version": "2.2",
  "header": ["time", "expire"],
  "functions": [{
    "name": "constructor",
    "inputs": [],
    "outputs": []
  }, {
    "name": "renderHelloWorld",
    "inputs": [],
    "outputs": [{
      "name": "value0",
      "type": "string"
    }]
  }, {
    "name": "touch",
    "inputs": [],
    "outputs": []
  }, {
    "name": "sendValue",
    "inputs": [{
      "name": "dest",
      "type": "address"
    }, {
      "name": "amount",
      "type": "uint128"
    }, {
      "name": "bounce",
      "type": "bool"
    }],
    "outputs": []
  }, {
    "name": "timestamp",
    "inputs": [],
    "outputs": [{
      "name": "timestamp",
      "type": "uint32"
    }]
  }],
  "data": [],
  "events": [],
  "fields": [{
    "name": "_pubkey",
    "type": "uint256"
  }, {
    "name": "_timestamp",
    "type": "uint64"
  }, {
    "name": "_constructorFlag",
    "type": "bool"
  }, {
    "name": "timestamp",
    "type": "uint32"
  }]
};
},{}],"App.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var everscale_inpage_provider_1 = require("everscale-inpage-provider");

var ever = new everscale_inpage_provider_1.ProviderRpcClient();

var App_abi_1 = __importDefault(require("../build/App.abi"));

function behavior(name, fn) {
  document.querySelectorAll("[data-behavior=".concat(name, "]")).forEach(fn);
}

function requestPermissions() {
  return ever.requestPermissions({
    permissions: ['basic', 'accountInteraction']
  });
}

function connect() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , ever.requestPermissions({
            permissions: ['basic', 'accountInteraction']
          })];

        case 1:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

function setNetworkChanged(network) {
  var mod = network === 'mainnet' ? 'success' : 'secondary';
  behavior('network', function (elem) {
    return elem.innerHTML = "<span class=\"badge bg-".concat(mod, "\">").concat(network, "</span>");
  });
}

function App() {
  return __awaiter(this, void 0, void 0, function () {
    var providerState, contractAddress, contract, timestamp, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , ever.hasProvider()];

        case 1:
          if (!_a.sent()) {
            behavior('extension', function (elem) {
              return elem.style.display = 'block';
            });
          } else {
            behavior('extension', function (elem) {
              return elem.style.display = 'none';
            });
            behavior('main', function (elem) {
              return elem.style.display = 'block';
            });
            behavior('connect', function (elem) {
              return elem.onclick = requestPermissions;
            });
          }

          return [4
          /*yield*/
          , ever.ensureInitialized()];

        case 2:
          _a.sent();

          return [4
          /*yield*/
          , ever.getProviderState()];

        case 3:
          providerState = _a.sent();
          console.log(providerState);
          setNetworkChanged(providerState.selectedConnection);
          return [4
          /*yield*/
          , ever.subscribe('networkChanged')];

        case 4:
          _a.sent().on('data', function (event) {
            setNetworkChanged(event.selectedConnection);
          });

          contractAddress = new everscale_inpage_provider_1.Address('0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9');
          contract = new ever.Contract(App_abi_1.default, contractAddress);
          _a.label = 5;

        case 5:
          _a.trys.push([5, 7,, 8]);

          return [4
          /*yield*/
          , contract.methods.timestamp({})];

        case 6:
          timestamp = _a.sent();
          console.log(timestamp);
          return [3
          /*break*/
          , 8];

        case 7:
          error_1 = _a.sent();

          if (error_1 instanceof everscale_inpage_provider_1.TvmException) {
            console.error(error_1.code);
          }

          return [3
          /*break*/
          , 8];

        case 8:
          return [2
          /*return*/
          ];
      }
    });
  });
}

App().catch(console.error);
},{"everscale-inpage-provider":"../node_modules/everscale-inpage-provider/dist/index.js","../build/App.abi":"../build/App.abi.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "38237" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","App.ts"], null)
//# sourceMappingURL=/App.7a936cda.js.map