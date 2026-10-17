/* Static captive-portal UI. All privileged actions must happen in the backend.
   Configure window.HOTSPOT_API_BASE in a deployment-specific config file. */
(() => {
  "use strict";
  const API = (window.HOTSPOT_API_BASE || "").replace(/\/$/, "");
  const $ = (id) => document.getElementById(id);
  let selectedPlan = null;
  let sessionEnd = null;
  let timerHandle = null;
  const plans = [
    {id:"hour-1",name:"Quick Browse",minutes:60,priceKes:10,featured:false},
    {id:"hour-3",name:"Stay Awhile",minutes:180,priceKes:25,featured:true},
    {id:"hour-6",name:"Long Session",minutes:360,priceKes:40,featured:false}
  ];
  const money = (amount) => "KES " + Number(amount).toLocaleString("en-KE");
  const durationLabel = (minutes) => minutes % 60 === 0 ? (minutes/60) + " hour" + (minutes===60?"":"s") : minutes + " min";
  function renderPlans(items) {
    $("plans").innerHTML = items.map(p => `
      <article class="plan ${p.featured ? "featured" : ""}">
        <span class="duration">${durationLabel(p.minutes)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${money(p.priceKes)}<small> / plan</small></div>
        <ul><li>1 Mbps down / up</li><li>One registered device</li><li>Prepaid access</li></ul>
        <button class="primary choose-plan" data-plan="${escapeHtml(p.id)}" type="button">Choose plan <span>→</span></button>
      </article>`).join("");
    document.querySelectorAll(".choose-plan").forEach(btn => btn.addEventListener("click", () => choosePlan(items.find(p => p.id === btn.dataset.plan))));
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function choosePlan(plan) {
    selectedPlan = plan;
    $("selected-name").textContent = plan.name;
    $("selected-duration").textContent = durationLabel(plan.minutes) + " · 1 Mbps down/up";
    $("selected-price").textContent = money(plan.priceKes);
    $("checkout").classList.remove("hidden");
    $("session").classList.add("hidden");
    $("payment-status").textContent = "";
    $("payment-status").className = "message";
    $("checkout").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("change-plan").addEventListener("click", () => $("checkout").classList.add("hidden"));
  $("payment-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = $("payment-status");
    status.className = "message";
    const phone = $("phone").value.trim();
    const receipt = $("receipt").value.trim().toUpperCase();
    if (!selectedPlan) return;
    if (!/^(?:\+?254|0)?7\d{8}$/.test(phone.replace(/[\s-]/g,""))) {
      status.textContent = "Enter a valid Kenyan mobile number."; status.classList.add("error"); return;
    }
    if (!/^[A-Z0-9]{8,20}$/.test(receipt)) {
      status.textContent = "Check the M-Pesa transaction code and try again."; status.classList.add("error"); return;
    }
    if (!API) {
      status.textContent = "Portal is in setup mode: the secure payment-verification API has not been configured yet. No payment has been verified and no internet access has been granted.";
      status.classList.add("error"); return;
    }
    const button = event.submitter;
    button.disabled = true; button.textContent = "Checking payment…";
    try {
      const response = await fetch(API + "/hotspot/payments/verify", {
        method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({plan_id:selectedPlan.id,phone,receipt_code:receipt})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Payment could not be verified.");
      if (result.status !== "active" || !result.expires_at) {
        status.textContent = result.message || "Payment has not been confirmed yet. Wait a moment and try again.";
        status.classList.add("error"); return;
      }
      sessionEnd = new Date(result.expires_at).getTime();
      $("session-copy").textContent = "Package: " + selectedPlan.name + ". Your device has been authorized by the hotspot.";
      $("checkout").classList.add("hidden"); $("session").classList.remove("hidden");
      startCountdown(); $("session").scrollIntoView({behavior:"smooth",block:"center"});
    } catch (err) {
      status.textContent = err.message || "Could not reach the verification service. Please try again.";
      status.classList.add("error");
    } finally {
      button.disabled = false; button.innerHTML = 'I\'ve paid — verify payment <span>→</span>';
    }
  });
  function startCountdown() {
    clearInterval(timerHandle);
    const tick = () => {
      const left = Math.max(0, Math.floor((sessionEnd - Date.now()) / 1000));
      const h = String(Math.floor(left/3600)).padStart(2,"0");
      const m = String(Math.floor((left%3600)/60)).padStart(2,"0");
      const s = String(left%60).padStart(2,"0");
      $("countdown").textContent = h + ":" + m + ":" + s;
      if (!left) { clearInterval(timerHandle); $("session-copy").textContent = "Your package has expired. Reconnect and choose a new plan."; }
    };
    tick(); timerHandle = setInterval(tick,1000);
  }
  renderPlans(plans);
})();