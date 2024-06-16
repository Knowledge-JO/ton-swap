import { NetworkProvider } from '@ton/blueprint';
import { SwapRoot } from '../wrappers/SwapRoot';
import { swapRootAddress } from '../wrappers/constants';
import { Address, toNano } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;
    if (!address) return;

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));

    await swapRoot.sendChangeAdmin(
        sender,
        toNano('0.01'),
        Address.parse('UQA2DDvgJA4S5MWjSDvSj8NqaN2uqrOgjfxKSHZhqTde0EWI'),
    );
}
