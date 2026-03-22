"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BANGALORE_AREAS,
  CITY_OPTIONS,
  CUISINE_OPTIONS,
  TIME_SLOT_OPTIONS,
} from "../../../lib/constants";

export default function CookRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    city: "",
    area: "",
    available_slots: [],
    cuisines: [],
    is_non_vegetarian: false,
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
      const { name, value, type, checked, files } = e.target;

      if (type === "checkbox") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
        return;
      }

      if (type === "file") {
        setFormData((prev) => ({
          ...prev,
          photo: files?.[0] || null,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      const alreadySelected = currentValues.includes(value);

      return {
        ...prev,
        [field]: alreadySelected
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const showError = (text) => {
    setMessage(text);
    setIsError(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.mobile_number.trim() ||
      !formData.city.trim() ||
      !formData.area.trim()
    ) {
      showError("Please fill all mandatory fields.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile_number.trim())) {
      showError("Please enter a valid 10-digit mobile number.");
      return false;
    }

    if (formData.available_slots.length < 1) {
      showError("Please select at least one available slot.");
      return false;
    }

    if (formData.cuisines.length < 1) {
      showError("Please select at least one cuisine.");
      return false;
    }

    if (!formData.photo) {
      showError("Please upload cook photo.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const body = new FormData();
      body.append("name", formData.name.trim());
      body.append("mobile_number", formData.mobile_number.trim());
      body.append("city", formData.city.trim());
      body.append("area", formData.area.trim());
      body.append("is_non_vegetarian", String(formData.is_non_vegetarian));
      body.append("photo", formData.photo);

      formData.available_slots.forEach((slot) => {
        body.append("available_slots", slot);
      });

      formData.cuisines.forEach((cuisine) => {
        body.append("cuisines", cuisine);
      });

      const response = await fetch("/api/cooks", {
        method: "POST",
        body,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Something went wrong");
      }

      setMessage("Cook registered successfully ✅");
      setIsError(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setFormData({
        name: "",
        mobile_number: "",
        city: "",
        area: "",
        available_slots: [],
        cuisines: [],
        is_non_vegetarian: false,
        photo: null,
      });

      const fileInput = document.getElementById("photo");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      showError(error.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cook-register-page">
      <div className="cook-register-shell">
        <div className="cook-register-topbar">
          <Link href="/" className="back-link">
            ← Back
          </Link>
        </div>

        <div className="cook-register-hero">
          <p className="cook-register-eyebrow">HomeCook</p>
          <h1 className="cook-register-title">Create your cook profile</h1>
          <p className="cook-register-subtitle">
            Tell households who you are, where you cook, your available time
            slots, cuisines, and upload your profile photo.
          </p>
        </div>

        {message ? (
          <div className={isError ? "top-notification error" : "top-notification success"}>
            {message}
          </div>
        ) : null}

        <form className="cook-form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="mobile_number">Mobile Number *</label>
              <input
                id="mobile_number"
                name="mobile_number"
                type="text"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="Enter your 10-digit mobile number"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Select city</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="area">Area *</label>
              <select
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
              >
                <option value="">Select area</option>
                {BANGALORE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-full">
              <label>Cook Photo *</label>

              <div className="photo-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => document.getElementById("camera-photo-input")?.click()}
                >
                  Click Photo
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => document.getElementById("gallery-photo-input")?.click()}
                >
                  Upload from Gallery
                </button>
              </div>

              <input
                id="camera-photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
                className="hidden-file-input"
              />

              <input
                id="gallery-photo-input"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden-file-input"
              />

              {formData.photo ? (
                <div className="photo-preview-wrap">
                  <p className="photo-file-name">{formData.photo.name}</p>
                  <img
                    src={URL.createObjectURL(formData.photo)}
                    alt="Cook preview"
                    className="photo-preview"
                  />
                </div>
              ) : (
                <p className="field-hint">Choose a clear face photo of the cook</p>
              )}
            </div>

            <div className="form-field form-field-full checkbox-field">
              <label className="checkbox-label">
                <input
                  name="is_non_vegetarian"
                  type="checkbox"
                  checked={formData.is_non_vegetarian}
                  onChange={handleChange}
                />
                <span>Can cook non-vegetarian food</span>
              </label>
            </div>

            <div className="form-section form-field-full">
              <div className="section-heading">
                <label>Available Slots *</label>
                <p>Select one or more time slots</p>
              </div>

              <div className="chip-group">
                {TIME_SLOT_OPTIONS.map((slot) => {
                  const isSelected = formData.available_slots.includes(slot);

                  return (
                    <button
                      key={slot}
                      type="button"
                      className={isSelected ? "chip selected" : "chip"}
                      onClick={() => toggleSelection("available_slots", slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-section form-field-full">
              <div className="section-heading">
                <label>Cuisines *</label>
                <p>Select all cuisines you can cook</p>
              </div>

              <div className="chip-group">
                {CUISINE_OPTIONS.map((cuisine) => {
                  const isSelected = formData.cuisines.includes(cuisine);

                  return (
                    <button
                      key={cuisine}
                      type="button"
                      className={isSelected ? "chip selected" : "chip"}
                      onClick={() => toggleSelection("cuisines", cuisine)}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
