function final(target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
	descriptor.writable = false;
}

export default final;
