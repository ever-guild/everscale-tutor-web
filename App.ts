import {
    Address,
    ProviderRpcClient,
    TvmException,
} from 'everscale-inpage-provider'
const ever = new ProviderRpcClient()
import abi from './AppAbi'

function behavior(name: string, fn: (elem: HTMLElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}

function requestPermissions() {
    return ever.requestPermissions({
        permissions: [
            //'basic',
            'accountInteraction',
        ],
    })
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
    const mod = network === 'mainnet' ? 'success': 'secondary'
    behavior(
        'network',
        elem => elem.innerHTML = `<span class="badge bg-${mod}">${network}</span>`
    )

}
async function App() {
    if (!(await ever.hasProvider())) {
        behavior('extension',elem => elem.style.display = 'block')
    } else {
        behavior('extension',elem => elem.style.display = 'none')
        behavior('main',elem => elem.style.display = 'block')
        behavior('connect', elem => elem.onclick = requestPermissions)
    }
    await ever.ensureInitialized();
    setNetworkChanged((await ever.getProviderState()).selectedConnection);
    (await ever.subscribe('networkChanged')).on('data', event => {
        setNetworkChanged(event.selectedConnection);
    })
    const contractAddress = new Address('0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9');
    const contract = new ever.Contract(abi, contractAddress)
    try {
        const timestamp = await contract.methods.timestamp({})
        console.log(timestamp);
    } catch (error) {
        if (error instanceof TvmException) {
            console.error(error.code);
        }
    }
}

App().catch(console.error)
