import { networkInterfaces, platform } from "os";
import setStaticIPv4Address, { IPV4_REGEXP, IFACE_REGEXP } from "../src/setup/util/setIPv4";
import { TwoKeys } from "../test/test-util/command-factory";
import { expect } from "chai";

/** Change IPv4 of an env var or default one for GitHub Actions */
export const NETWORK_INTERFACE = process.env.TWOKEYS_OOBE_NET_TEST_INTERFACE || "vEthernet (nat)";

function addOneToIPv4(ip: string): string {
	const numbers = ip.split(".").map(ipSection => parseInt(ipSection, 10));
	numbers[numbers.length - 1] = numbers[numbers.length - 1] + 1;
	if (numbers[numbers.length - 1] > 255) {
		numbers[numbers.length - 1] = 0;
	}

	return numbers.map(ipNo => ipNo.toFixed(0)).join(".");
}

describe("IPv4 setting tests", function () {
	if (platform() !== "win32") return;

	it("should validate an IPv4 address", () => {
		expect(IPV4_REGEXP.test(addOneToIPv4("172.23.64.2"))).to.be.true;
	});

	it("should validate an network interface name", () => {
		expect(IFACE_REGEXP.test(NETWORK_INTERFACE)).to.be.true;
	});

	it("should successfully change the IP address (if it hangs/timesout it failed)", async function () {
		// eslint-disable-next-line no-prototype-builtins

		// get new interface
		if (!networkInterfaces().hasOwnProperty(NETWORK_INTERFACE)) {
			this.skip();
			return;
		}
		

		const oldIp = networkInterfaces()[NETWORK_INTERFACE].filter(value => value.family === "IPv4")[0].address;
		const newIp = addOneToIPv4(oldIp);

		// DEW IT
		await setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			networkAdapter: NETWORK_INTERFACE,
			ipv4: newIp,
		});

		expect(networkInterfaces()[NETWORK_INTERFACE].filter(value => value.family === "IPv4")[0].address).to.equal(newIp);

		// Reset
		await setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			networkAdapter: NETWORK_INTERFACE,
			ipv4: oldIp,
		});

		expect(networkInterfaces()[NETWORK_INTERFACE].filter(value => value.family === "IPv4")[0].address).to.equal(oldIp);

	});
})