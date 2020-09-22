/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { networkInterfaces, platform } from "os";
import setStaticIPv4Address from "../../../src/setup/util/setIPv4";
import { TwoKeys } from "../../../test/test-util/command-factory";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

/** Change IPv4 for interface from an env var or default one for GitHub Actions */
export const NETWORK_INTERFACE = process.env.TWOKEYS_OOBE_NET_TEST_INTERFACE || "vEthernet (nat)";

/** Adds one to the final part of an IPv4 address  */
function addOneToIPv4(ip: string): string {
	const numbers = ip.split(".").map(ipSection => parseInt(ipSection, 10));
	numbers[numbers.length - 1] = numbers[numbers.length - 1] + 1;
	if (numbers[numbers.length - 1] > 255) {
		numbers[numbers.length - 1] = 0;
	}

	return numbers.map(ipNo => ipNo.toFixed(0)).join(".");
}

(platform() === "win32" ? describe : describe.skip)("IPv4 setting tests", function () {

	it("should successfully change the IP address (if it hangs/timesout it failed)", async function () {
		// eslint-disable-next-line no-prototype-builtins

		// get new interface
		if (!(Object.prototype.hasOwnProperty.call(networkInterfaces(), NETWORK_INTERFACE))) {
			this.skip();
			return;
		}

		// @ts-ignore
		const oldIp = networkInterfaces()[NETWORK_INTERFACE].filter(value => value.family === "IPv4")[0].address;
		const newIp = addOneToIPv4(oldIp);

		// DEW IT
		await setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			networkAdapter: NETWORK_INTERFACE,
			ipv4: newIp,
		});

		// @ts-ignore
		expect(networkInterfaces()[NETWORK_INTERFACE].filter(value => value.family === "IPv4")[0].address).to.equal(newIp);

		// Reset
		await setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			networkAdapter: NETWORK_INTERFACE,
			ipv4: oldIp,
		});

		// @ts-ignore
		expect(networkInterfaces()[NETWORK_INTERFACE].filter(value => value.family === "IPv4")[0].address).to.equal(oldIp);

	});

	it("should fail to set an IPv4 address not in the right format", async () => {
		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.0.255.1", // Too long
			networkAdapter: "IGNORED",
		})).to.eventually.rejectedWith("not in the format");

		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.123", // Too short
			networkAdapter: "IGNORED",
		})).to.eventually.rejectedWith("not in the format");

		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.123.288", // 288 is too buig
			networkAdapter: "IGNORED",
		})).to.eventually.rejectedWith("not in the format");

		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "NOT.A.IPv4.addr",
			networkAdapter: "IGNORED",
		})).to.eventually.rejectedWith("not in the format");
	});

	it("should fail to set a non-valid interface name", async () => {
		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.0.50", // Too long
			networkAdapter: "Has a ; semiclon in it",
		})).to.eventually.rejectedWith("not alphanumeric");

		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.0.50", // Too long
			networkAdapter: "Has a $(psvarible) and some \" \" in it",
		})).to.eventually.rejectedWith("not alphanumeric");

		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.0.50", // Too long
			networkAdapter: "Has some ` ` in it",
		})).to.eventually.rejectedWith("not alphanumeric");
	});

	it("should fail on a non-existant network interface", async () => {
		await expect(setStaticIPv4Address(new TwoKeys({
			commandName: "ipv4"
		}, {}), {
			ipv4: "192.168.0.50", // Too long
			networkAdapter: "Valid Name",
		})).to.eventually.rejectedWith("find network interface");
	});
});