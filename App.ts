import {
    Address,
    ProviderRpcClient,
    TvmException
} from 'everscale-inpage-provider';

const ever = new ProviderRpcClient();

import abi from './AppAbi';

// import DePoolAbi from './DePoolAbi';

function behavior(name: string, fn: any) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}
const onclick = (fn: any) => (elem: HTMLElement) => {
    elem.onclick = fn
}
const show = () => (elem: HTMLElement) => {
    elem.style.display = 'block'
}
const hide = () => (elem: HTMLElement) => {
    elem.style.display  = 'none'
}
const innerText = (text: string) => (elem: HTMLElement) => {
    elem.innerText = text
}
const innerHtml = (text: string) => (elem: HTMLElement) => {
    elem.innerHTML = text
}
const disabled = (status: boolean) => (elem: HTMLButtonElement | HTMLInputElement) => {
    elem.disabled = status
}
const addClass = (name: string) => (elem: HTMLElement) => {
    elem.classList.add(name);
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
    const { accountInteraction } = await ever.requestPermissions({
        permissions: [
            'basic',
            // 'accountInteraction',
        ],
    });
    if (accountInteraction != null) {
        if (accountInteraction.address) {
            behavior('address', show())
            behavior('address', innerText(accountInteraction.address.toString()))
        }
    }
    console.log('accountInteraction:', accountInteraction)
}

function setNetworkChanged(network: string) {
    const mod = network === 'mainnet' ? 'success': 'secondary'
    behavior('network', innerHtml(`<span class="badge bg-${mod}">${network}</span>`))
}

async function App() {
    if (!(await ever.hasProvider())) {
        behavior('extension', show())
    } else {
        behavior('extension', hide())
        behavior('connect', show())
        behavior('connect', onclick(requestPermissions))
    }
    await ever.ensureInitialized();
    setNetworkChanged((await ever.getProviderState()).selectedConnection);
    (await ever.subscribe('networkChanged')).on('data', event => {
        setNetworkChanged(event.selectedConnection);
    })
    // const { accountInteraction } = await ever.requestPermissions({
    //     permissions: [
    //         'basic',
    //         // 'accountInteraction',
    //     ],
    // });
    // if (accountInteraction != null) {
    //     if (accountInteraction.address) {
    //         behavior('address', show())
    //         behavior('address', innerText(accountInteraction.address.toString()))
    //     }
    // }
    // console.log('accountInteraction:', accountInteraction)

    const contractAddress = new Address('0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9');
    //
    const contract = new ever.Contract(abi, contractAddress)
    try {
        const timestamp = await contract.methods.timestamp({}).call();
        console.log(timestamp);
    } catch (error) {
        if (error instanceof TvmException) {
            console.error(error.code);
        }
    }

    // const transaction = await dApp.methods.touch({}).send({
    //     from: selectedAddress,
    //     amount: '10500000000',
    //     bounce: true,
    // })
    // console.log(transaction)
    //const dePool = ever.createContract(DePoolAbi, contractAddress);

    // const transaction = await dePool
    //     .methods
    //     .addOrdinaryStake({
    //         stake: '10000000000',
    //     }).send({
    //         from: selectedAddress,
    //         amount: '10500000000',
    //         bounce: true,
    //     });
    // try {
    //     const output = await dePool
    //         .methods
    //         .getParticipantInfo({
    //             addr: selectedAddress,
    //         })
    //         .call();
    //     console.log(output);
    // } catch (e) {
    //     if (e instanceof TvmException) {
    //         console.error(e.code);
    //     }
    // }
}



App().catch(console.error)
