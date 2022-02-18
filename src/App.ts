import {Address, ProviderRpcClient,} from 'everscale-inpage-provider';
import abi from '../build/App.abi';
import addr from '../build/App.addr';

const ever = new ProviderRpcClient();

function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn);
}

const innerText = (text: string) => (elem: HTMLElement | HTMLButtonElement) => {
    elem.innerText = text;
}

async function timestampAction() {
    const contract = await Contract();
    try {
        const out = await contract.methods.timestamp({}).call();
        behavior('out', innerText(out.timestamp));
    } catch (error) {
        console.error(error);
    }
}

async function renderHelloWorldAction() {
    const contract = await Contract();
    try {
        const out = await contract.methods.renderHelloWorld({}).call();
        behavior('out', innerText(out.value0));
    } catch (error) {
        console.error(error);
    }
}

async function touchActionAction() {
    const contract = await Contract();
    const providerState = await ever.getProviderState();
    const publicKey = providerState.permissions.accountInteraction.publicKey;
    console.error(`touchActionAction publicKey=${publicKey}`);
    try {
        const response = await contract.methods.touch({}).sendExternal({
            publicKey,
            withoutSignature: true,
        });
        console.log(response);
        const trx = response.transaction;
        const out = `aborted=${trx.aborted} <a href="${await explorerTransactionDetails(trx.id.hash)}">trx=${trx.id.hash}</a>`;
        behavior('out',elem => elem.innerHTML = out);
    } catch (error) {
        console.error(error);
    }
}

async function explorerTransactionDetails(hash: string) {
    const providerState = await ever.getProviderState();
    switch (providerState.selectedConnection) {
        case 'mainnet':
            return `https://ever.live/transactions/transactionDetails?id=${hash}`
        case 'testnet':
            return `https://net.ever.live/transactions/transactionDetails?id=${hash}`
        case 'localnet':
            return `http://localhost/transactions/transactionDetails?id=${hash}`
        default:
            return `#${hash}`
    }
}

function requestPermissions() {
    return ever.requestPermissions({
        permissions: [
            'basic',
            'accountInteraction',
        ],
    });
}

async function connect() {
    await ever.requestPermissions({
        permissions: [
            'basic',
            'accountInteraction',
        ],
    });
}

async function checkConnect() {
    const providerState = await ever.getProviderState();
    const permissions = providerState.permissions;
    const network = providerState.selectedConnection;
    if (!contractAddress(network) || !permissions.accountInteraction) {
        behavior('connect', elem => elem.onclick = requestPermissions);
        switchScreen("login");
        const connectText = elem => {
            const disabled = !contractAddress(network);
            if ("disabled" in elem) elem.disabled = disabled;
            elem.innerText = disabled ? `Contract not deployd into ${network}` : `Connect with ${network} for interact contract`;
        };
        behavior('connect', connectText);
    } else {
        // INFO for transactionsFound and contractStateChanged need permissions
        const providerState = await ever.getProviderState();
        (await ever.subscribe('transactionsFound', {
            address: contractAddress(providerState.selectedConnection),
        })).on('data', (event) => {
            console.log(':', {
                address: event.address,
                transactions: event.transactions,
                info: event.info,
            });
        });
        (await ever.subscribe('contractStateChanged', {
            address: contractAddress(providerState.selectedConnection),
        })).on('data', (event) => {
            console.log('permissionsChanged:', {
                address: event.address,
                state: event.state,
            });
        });
        switchScreen("main");
        const account = permissions.accountInteraction;
        behavior('address', innerText(account.address.toString()));
        behavior('publicKey', innerText(account.publicKey.toString()));
        behavior('timestampAction', elem => elem.onclick = timestampAction);
        behavior('renderHelloWorldAction', elem => elem.onclick = renderHelloWorldAction);
        behavior('touchActionAction', elem => elem.onclick = touchActionAction);
    }
}
async function setNetworkChanged(network: string) {
    const mod = network === 'mainnet' ? 'success' : 'secondary';
    const out = `<span class="badge bg-${mod}">${network}</span>`;
    behavior('network',elem => elem.innerHTML = out);
    await checkConnect();
}

function contractAddress(network: string, name = "App"): Address | null {
    if (addr[network] && addr[network][name]) {
        return new Address(addr[network][name]);
    }
    return null
}

async function Contract() {
    const providerState = await ever.getProviderState();
    const address = contractAddress(providerState.selectedConnection);
    return new ever.Contract(abi, address);
}

function switchScreen(to: string) {
    [
        "extension",
        "login",
        "main",
    ].forEach(screen => {
        const switcher = elem => elem.style.display = (to === screen ? 'block' : 'none');
        behavior(screen, switcher);
    });
}

async function mainFlow() {
    const providerState = await ever.getProviderState();
    await setNetworkChanged(providerState.selectedConnection);
    (await ever.subscribe('networkChanged')).on('data', event => {
        console.log('networkChanged:', event.selectedConnection);
        setNetworkChanged(event.selectedConnection);
    });
    (await ever.subscribe('permissionsChanged')).on('data', async (event) => {
        console.log('permissionsChanged:', event.permissions);
        await checkConnect();
    });
}

async function App() {
    if ((await ever.hasProvider())) {
        try {
            await ever.ensureInitialized();
            await mainFlow();
        } catch (error) {
            throw error; // TODO handle it
        }
    } else {
        switchScreen("extension");
    }
}

App().catch((error) => console.error(error));
