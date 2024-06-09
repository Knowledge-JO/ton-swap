import { NetworkProvider } from '@ton/blueprint';
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';
import { SwapAggregator } from '../wrappers/SwapAggregator';
import {
    Factory,
    MAINNET_FACTORY_ADDR,
    JettonRoot,
    JettonWallet,
    Asset,
    PoolType,
    VaultJetton,
    ReadinessStatus,
} from '@dedust/sdk';

const SCALE_ADDRESS = Address.parse(
    'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
);

const BOLT_ADDRESS = Address.parse(
    'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIw',
);

const SCALE = Asset.jetton(SCALE_ADDRESS);
const TON = Asset.native();
const BOLT = Asset.jetton(BOLT_ADDRESS);
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

    // dedust factory
    const factory = provider.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR),
    );

    const scaleRoot = provider.open(
        JettonRoot.createFromAddress(SCALE_ADDRESS),
    );
    const boltRoot = provider.open(JettonRoot.createFromAddress(BOLT_ADDRESS));
    const scaleWallet = provider.open(await scaleRoot.getWallet(address));
    const boltWallet = provider.open(await boltRoot.getWallet(address));

    const amountIn = toNano('0.3');

    const TON_SCALE_POOL = provider.open(
        await factory.getPool(PoolType.VOLATILE, [TON, SCALE]),
    );

    const TON_BOLT_POOL = provider.open(
        await factory.getPool(PoolType.VOLATILE, [TON, BOLT]),
    );

    const scaleVault = provider.open(
        await factory.getJettonVault(SCALE_ADDRESS),
    );

    const boltVault = provider.open(await factory.getJettonVault(BOLT_ADDRESS));

    // Check if pool exists:
    if ((await TON_SCALE_POOL.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('Pool (TON, SCALE) does not exist.');
    }

    // Check if vault exits:
    if ((await scaleVault.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('Vault (SCALE) does not exist.');
    }
    // Check if pool exists:
    if ((await TON_BOLT_POOL.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('Pool (TON, BOLT) does not exist.');
    }

    await boltWallet.sendTransfer(sender, toNano('0.05'), {
        queryId: 0,
        amount: amountIn,
        destination: userSwapAggregatorAddress,
        responseAddress: address,
        customPayload: new Cell(),
        forwardAmount: toNano('0.015'),
        forwardPayload: beginCell()
            .storeRef(
                VaultJetton.createSwapPayload({
                    poolAddress: TON_BOLT_POOL.address,
                    limit,
                    swapParams: { recipientAddress: address },
                }),
            )
            .storeCoins(toNano('0.01')) //jetton converted to ton for fee deduction
            .storeAddress(
                (await boltRoot.getWallet(userSwapAggregatorAddress)).address, // aggregator jetton address
            )
            .storeAddress(boltVault.address) // jetton vault
            .storeRef(beginCell().storeAddress(address).endCell())
            .endCell(),
    });
}

// cell swap_payload = forward_payload~load_ref();
//     int jettonToTon = forward_payload~load_coins();
//     slice aggregator_jetton_addr = forward_payload~load_msg_addr();
//     slice jetton_vault = forward_payload~load_msg_addr();
//     slice referral_addr = forward_payload~load_ref().begin_parse();
//     var (int trade_fee, int referral_reward, int trade_value) = calc_fees(fixed_fee, jettonToTon);
