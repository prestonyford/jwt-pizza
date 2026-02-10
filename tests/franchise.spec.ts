import { expect, test } from "playwright-test-coverage";
import { Page } from "playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
	let loggedInUser: User | undefined;
	const validUsers: Record<string, User> = {
		"pf@jwt.com": {
			id: "1",
			name: "Preston Ford",
			email: "pf@jwt.com",
			password: "password",
			roles: [{ role: Role.Diner }, { objectId: "1", role: Role.Franchisee }],
		},
	};

	await page.route("*/**/api/auth", async (route) => {
		if (route.request().method() === "PUT") {
			const loginReq = route.request().postDataJSON();
			const user = validUsers[loginReq.email];
			if (!user || user.password !== loginReq.password) {
				await route.fulfill({
					status: 401,
					json: { error: "Unauthorized" },
				});
				return;
			}
			loggedInUser = validUsers[loginReq.email];
			const loginRes = {
				user: loggedInUser,
				token: "abcdef",
			};
			await route.fulfill({ json: loginRes });
		}
	});

	await page.route("*/**/api/franchise/*", async (route) => {
		if (route.request().method() === "GET") {
			const res = [
				{
					id: "1",
					name: "franchise 1",
					admins: !loggedInUser ? [] : [
						validUsers[loggedInUser.email ?? ""],
					],
					stores: [
						{
							id: "1",
							name: "store 1",
							totalRevenue: 0.6084,
						},
					],
				},
			];
			await route.fulfill({ json: res });
		}
	});

	await page.route("*/**/api/user/me", async (route) => {
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: loggedInUser });
	});

	await page.goto("/");
}

test("login franchise dashboard", async ({ page }) => {
	await basicInit(page);

	await page.getByLabel("Global").getByRole("link", { name: "Franchise" })
		.click();
	await expect(page.getByRole("main")).toContainText(
		"So you want a piece of the pie?",
	);

	await expect(page.getByRole("alert")).toContainText(
		"If you are already a franchisee, pleaseloginusing your franchise account",
	);
	await page.getByRole("link", { name: "login", exact: true }).click();
	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(
		"pf@jwt.com",
	);
	await page.getByRole("textbox", { name: "Email address" }).press("Tab");
	await page.getByRole("textbox", { name: "Password" }).fill("password");
  	await page.getByRole("button", { name: "Login" }).click();

	await expect(page.locator("tbody")).toContainText("0.608 ₿");
	await expect(page.locator("tbody")).toContainText("store 1");
});
