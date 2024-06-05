import { NetworkProvider } from '@ton/blueprint';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';
import { JettonRoot } from '@dedust/sdk';
import { Address, toNano } from '@ton/core';
import { SwapAggregator } from '../wrappers/SwapAggregator';

const SCALE_ADDRESS = Address.parse(
    'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
);

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));

    const userAggregatorAddress =
        await swapRoot.getUserAggregatorAddress(address);

    const swapAggregator = provider.open(
        SwapAggregator.createFromAddress(userAggregatorAddress),
    );

    const scaleRoot = provider.open(
        JettonRoot.createFromAddress(SCALE_ADDRESS),
    );

    const userAggregatorJettonAddr = await scaleRoot.getWalletAddress(
        userAggregatorAddress,
    );

    console.log('userAggregatorJettonAddr', userAggregatorJettonAddr);

    await swapAggregator.sendWithdrawJetton(sender, toNano('0.05'), {
        jettonAmount: toNano('0.3'),
        userAggregatorJettonAddress: userAggregatorJettonAddr,
    });
}
