import { NetworkProvider } from '@ton/blueprint';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));

    const { fixedFee, gasFee, fwdAmount, minValue } =
        await swapRoot.getSwapRootData();

    console.log({ fixedFee, gasFee, fwdAmount, minValue });
}
