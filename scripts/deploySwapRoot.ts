import { toNano } from '@ton/core';
import { SwapRoot } from '../wrappers/SwapRoot';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;
    const swapRoot = provider.open(
        SwapRoot.createFromConfig(
            {
                adminAddress: address,
                coAdminAddress: address,
                fee: toNano('0'),
                gasFee: toNano('0'),
                fwdAmount: toNano('0'),
                minValue: toNano('0'),
                swapAggregatorCode: await compile('SwapAggregator'),
            },
            await compile('SwapRoot'),
        ),
    );

    await swapRoot.sendDeploy(sender, toNano('0.005'));

    await provider.waitForDeploy(swapRoot.address);

    // run methods on `swapAggregator`
}
