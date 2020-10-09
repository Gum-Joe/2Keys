import { open as openDB } from "sqlite";
import sqlite3 from "sqlite3";
const query = "SELECT *  FROM software JOIN executables ON software.id = executables.softwareId;";

(async function (): Promise<void> {
	const db = await openDB({
		filename: "D:\\Users\\Kishan\\Documents\\Projects\\CONFIDENTIAL\\2Keys\\2Keys-UI\\twokeys\\packages\\@twokeys\\addons\\test\\non-mocha\\registry\\softwareTest\\twokeys-registry.db",
		driver: sqlite3.cached.Database,
	});
	console.log(await db.each(query));
})();
