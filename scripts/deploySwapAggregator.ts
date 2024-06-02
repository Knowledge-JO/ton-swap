import { toNano } from '@ton/core';
import { SwapAggregator } from '../wrappers/SwapAggregator';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const swapAggregator = provider.open(SwapAggregator.createFromConfig({}, await compile('SwapAggregator')));

    await swapAggregator.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(swapAggregator.address);

    // run methods on `swapAggregator`
}
