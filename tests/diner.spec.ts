import { expect, test } from "playwright-test-coverage";
import { Page } from "playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
	let loggedInUser: User | undefined;
	const validUsers: Record<string, User> = {
		"d@jwt.com": {
			id: "1",
			name: "diner user",
			email: "d@jwt.com",
			password: "diner",
			roles: [{ role: Role.Diner }],
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
		} else if (route.request().method() === "DELETE") {
			await route.fulfill({ json: { message: "logout successful" } });
		}
	});

	await page.route("*/**/api/order", async (route) => {
		if (route.request().method() === "GET") {
			const res = {
				dinerId: loggedInUser?.id,
				page: 1,
				orders: [
					{
						"id": 15,
						"franchiseId": 103,
						"storeId": 23,
						"date": "2026-02-09T04:08:39.000Z",
						"items": [
							{
								"id": 15,
								"menuId": 1,
								"description": "Veggie",
								"price": 0.0038,
							},
							{
								"id": 16,
								"menuId": 2,
								"description": "Pepperoni",
								"price": 0.0042,
							},
						],
					},
				],
			};
			await route.fulfill({ json: res });
		}
	});

	await page.route("*/**/api/user/me", async (route) => {
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: loggedInUser });
	});

	await page.goto("/");
}

test("diner view history", async ({ page }) => {
	await basicInit(page);

	await page.getByRole("link", { name: "Login" }).click();
	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(
		"d@jwt.com",
	);
	await page.getByRole("textbox", { name: "Email address" }).press("Tab");
	await page.getByRole("textbox", { name: "Password" }).fill("diner");
	await page.getByRole("button", { name: "Login" }).click();
	await page.getByRole("link", { name: "du" }).click();
	await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
	await expect(page.getByRole("main")).toContainText("diner user");
	await expect(page.getByRole("main")).toContainText("d@jwt.com");
	await expect(page.getByRole("main")).toContainText("diner");
	await expect(page.getByRole("main")).toContainText(
		"Here is your history of all the good times.",
	);
	await expect(page.locator("tbody")).toContainText("15");
	await expect(page.locator("tbody")).toContainText("0.008 ₿");
	await expect(page.locator("tbody")).toContainText(
		"2026-02-09T04:08:39.000Z",
	);
});

test("diner logout", async ({ page }) => {
	await basicInit(page);

	await page.getByRole("link", { name: "Login" }).click();
	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(
		"d@jwt.com",
	);
	await page.getByRole("textbox", { name: "Email address" }).press("Tab");
	await page.getByRole("textbox", { name: "Password" }).fill("diner");
	await page.getByRole("button", { name: "Login" }).click();

	await page.getByRole("link", { name: "Logout" }).click();
	await expect(page.locator("#navbar-dark")).toContainText("Login");
});

test("history component", async ({ page }) => {
	await basicInit(page);

	await page.getByRole("link", { name: "History" }).click();
	await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
	await expect(page.getByRole("main")).toContainText(
		'It all started in Mama Ricci\'s kitchen. She would delight all of the cousins with a hot pie in any style they could think of Milanese, Chicago deep dish, Detroit square pan, Neapolitan, or even fusion flatbread.Pizza has a long and rich history that dates back thousands of years. Its origins can be traced back to ancient civilizations such as the Egyptians, Greeks, and Romans. The ancient Egyptians were known to bake flatbreads topped with various ingredients, similar to modern-day pizza. In ancient Greece, they had a dish called "plakous" which consisted of flatbread topped with olive oil, herbs, and cheese.However, it was the Romans who truly popularized pizza-like dishes. They would top their flatbreads with various ingredients such as cheese, honey, and bay leaves.Fast forward to the 18th century in Naples, Italy, where the modern pizza as we know it today was born. Neapolitan pizza was typically topped with tomatoes, mozzarella cheese, and basil. It quickly became a favorite among the working class due to its affordability and delicious taste. In the late 19th century, pizza made its way to the United States through Italian immigrants.It gained popularity in cities like New York and Chicago, where pizzerias started popping up. Today, pizza is enjoyed worldwide and comes in countless variations and flavors. However, the classic Neapolitan pizza is still a favorite among many pizza enthusiasts. This is especially true if it comes from JWT Pizza!',
	);
});

test("about component", async ({ page }) => {
	await basicInit(page);

	await page.getByRole("link", { name: "About" }).click();
	await expect(page.getByRole("main")).toContainText("The secret sauce");
	await expect(page.getByRole("main")).toContainText(
		"At JWT Pizza, our amazing employees are the secret behind our delicious pizzas. They are passionate about their craft and spend every waking moment dreaming about how to make our pizzas even better. From selecting the finest ingredients to perfecting the dough and sauce recipes, our employees go above and beyond to ensure the highest quality and taste in every bite. Their dedication and attention to detail make all the difference in creating a truly exceptional pizza experience for our customers. We take pride in our team and their commitment to delivering the best pizza in town.",
	);
	await expect(page.getByRole("main")).toContainText("Our employees");
	await expect(page.getByRole("main")).toContainText(
		"JWT Pizza is home to a team of pizza enthusiasts who are truly passionate about their craft. They are constantly experimenting with new flavors, techniques, and ingredients to push the boundaries of traditional pizza-making. Their relentless pursuit of perfection is evident in every bite, as they strive to create a pizza experience that is unparalleled. Our employees understand that the secret to a great pizza lies in the details, and they leave no stone unturned in their quest for pizza perfection. We are proud to have such dedicated individuals on our team, as they are the driving force behind our reputation for exceptional quality and taste.",
	);
});

test("home page", async ({ page }) => {
	await basicInit(page);

	await expect(page.getByRole("heading")).toContainText(
		"The web's best pizza",
	);
	await expect(page.getByRole("main")).toContainText(
		"Pizza is an absolute delight that brings joy to people of all ages. The perfect combination of crispy crust, savory sauce, and gooey cheese makes pizza an irresistible treat. At JWT Pizza, we take pride in serving the web's best pizza, crafted with love and passion. Our skilled chefs use only the finest ingredients to create mouthwatering pizzas that will leave you craving for more. Whether you prefer classic flavors or adventurous toppings, our diverse menu has something for everyone. So why wait? Indulge in the pizza experience of a lifetime and visit JWT Pizza today!",
	);
});
