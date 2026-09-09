import http from "http";

const testComplaints = [
  "There is no water supply in our street for 5 days, also the road has had a huge pothole for 3 months",
  "Street lights on MG road have not worked for 2 weeks, please fix urgently",
  "My ration card correction request filed last month at the Revenue office is still pending, and there's also garbage piling up uncollected near our house",
];

async function testAnalyzeEndpoint() {
  console.log("🧪 Testing /api/analyze endpoint\n");
  console.log("=" + "=".repeat(69) + "\n");

  for (let i = 0; i < testComplaints.length; i++) {
    const complaint = testComplaints[i];
    console.log(`Test ${i + 1}/3: "${complaint.substring(0, 60)}..."\n`);

    try {
      const response = await new Promise<{
        issues: Array<{
          department: string;
          issue_text: string;
          deadline: string | null;
          priority: string;
        }>;
      }>((resolve, reject) => {
        const postData = JSON.stringify({ text: complaint });

        const options = {
          hostname: "localhost",
          port: 4000,
          path: "/api/analyze",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        };

        const req = http.request(options, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode !== 200) {
                reject(new Error(`Status ${res.statusCode}: ${data}`));
              } else {
                resolve(parsed);
              }
            } catch (e) {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          });
        });

        req.on("error", reject);
        req.write(postData);
        req.end();
      });

      console.log(`✅ Received ${response.issues.length} issue(s):\n`);
      response.issues.forEach((issue, idx) => {
        console.log(
          `   ${idx + 1}. [${issue.department}] ${issue.issue_text}`
        );
        console.log(`      Priority: ${issue.priority}`);
        console.log(`      Deadline: ${issue.deadline || "Not specified"}`);
      });
    } catch (error) {
      console.log(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    console.log("\n" + "-".repeat(70) + "\n");
  }

  console.log("🎉 Test completed!");
}

testAnalyzeEndpoint().catch(console.error);
