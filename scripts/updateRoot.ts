import { NetworkProvider } from '@ton/blueprint';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';
import { toNano } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));

    await swapRoot.sendUpdateFees(sender, toNano('0.005'), {
        fee: toNano('0.05'),
        gasFee: toNano('0.2'),
        fwdAmount: toNano('0.15'),
        minValue: toNano('0.2'),
    });
}
