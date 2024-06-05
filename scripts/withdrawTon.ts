import { NetworkProvider } from '@ton/blueprint';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';
import { SwapAggregator } from '../wrappers/SwapAggregator';
import { toNano } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));

    const swapAggregatorAddress =
        await swapRoot.getUserAggregatorAddress(address);

    const swapAggregator = provider.open(
        SwapAggregator.createFromAddress(swapAggregatorAddress),
    );

    await swapAggregator.sendWithdrawExcessTon(
        sender,
        toNano('0.01'),
        toNano('1.028'),
    );
}
