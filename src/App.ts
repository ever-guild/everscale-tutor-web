import {
    Address,
    ProviderRpcClient,
} from 'everscale-inpage-provider';
import abi from '../build/App.abi';
import addr from '../build/App.addr';

const ever = new ProviderRpcClient();

function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn);
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

function setNetworkChanged(network: string) {
    const mod = network === 'mainnet' ? 'success' : 'secondary';
    behavior(
        'network',
        elem => elem.innerHTML = `<span class="badge bg-${mod}">${network}</span>`
    );
    behavior(
        'connect',
        elem => {
            const disabled = !contractAddress(network);
            if ("disabled" in elem) elem.disabled = disabled;
            elem.innerText = disabled ? `Contract not deployd into ${network}` : `Connect with ${network} for interact contract`;
        }
    );
}

function contractAddress(network: string, name = "App"): Address | null {
    if (addr[network] && addr[network][name]) {
        return new Address(addr[network][name]);
    }
    return null;
}

async function Contract() {
    const providerState = await ever.getProviderState();
    const address = contractAddress(providerState.selectedConnection);
    return  new ever.Contract(abi, address);
}

function extensionNotInstalledFlow() {
    behavior('extension', elem => elem.style.display = 'block');
}

async function mainFlow() {
    behavior('extension', elem => elem.style.display = 'none');
    behavior('main', elem => elem.style.display = 'block');
    behavior('connect', elem => elem.onclick = requestPermissions);
    const providerState = await ever.getProviderState();
    console.log(providerState)
    setNetworkChanged(providerState.selectedConnection);
    (await ever.subscribe('networkChanged')).on('data', event => {
        setNetworkChanged(event.selectedConnection);
    });
    const contract = await Contract();
    try {
        const out = await contract.methods.timestamp({}).call();
        console.log('timestamp:', out.timestamp);
    } catch (error) {
        console.error(error);
    }
}

async function App() {
    try {
        await ever.ensureInitialized();
        await mainFlow();
    } catch (error) {
        extensionNotInstalledFlow();
        throw error;
    }
}
App().catch((error) => console.error(error));
