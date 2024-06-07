import { NetworkProvider } from '@ton/blueprint';
import { Factory, MAINNET_FACTORY_ADDR, Asset, PoolType } from '@dedust/sdk';
import { Address, beginCell, toNano } from '@ton/core';
import { SwapAggregator } from '../wrappers/SwapAggregator';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';
import { ReadinessStatus } from '@dedust/sdk';

const SCALE_ADDRESS = Address.parse(
    'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
);

const TON = Asset.native();
const SCALE = Asset.jetton(SCALE_ADDRESS);
const limit = toNano(0);
const deadline = 5;

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));
    const userSwapAggregatorAddress =
        await swapRoot.getUserAggregatorAddress(address);

    console.log(userSwapAggregatorAddress);

    const swapAggregator = provider.open(
        SwapAggregator.createFromAddress(userSwapAggregatorAddress),
    );

    const factory = provider.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR),
    );

    const tonVault = provider.open(await factory.getNativeVault());

    const pool = provider.open(
        await factory.getPool(PoolType.VOLATILE, [TON, SCALE]),
    );

    // ...

    // Check if pool exists:
    if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('Pool (TON, SCALE) does not exist.');
    }

    // Check if vault exits:
    if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('Vault (TON) does not exist.');
    }
    const referralAddress = beginCell().storeAddress(address).endCell();

    await swapAggregator.sendSwapTonToJetton(sender, toNano('0.05'), {
        receipientAddress: address,
        poolAddress: pool.address,
        tonVaultAddr: tonVault.address,
        limit,
        deadline,
        referralAddress,
    });
}
