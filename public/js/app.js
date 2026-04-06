document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault();

  const nominal = document.getElementById("nominal").value;
  const provider = document.getElementById("provider").value;

  let rate = 0.8;

  if (provider === "telkomsel") rate = 0.85;
  if (provider === "xl") rate = 0.8;
  if (provider === "axis") rate = 0.75;

  const hasil = nominal * rate;

  document.getElementById("result").innerHTML =
    `Hasil convert: Rp ${hasil.toLocaleString()}`;
});
