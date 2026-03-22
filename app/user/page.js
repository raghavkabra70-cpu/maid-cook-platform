"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BANGALORE_AREAS,
  CITY_OPTIONS,
  CUISINE_OPTIONS,
  TIME_SLOT_OPTIONS,
  VEG_PREFERENCE_OPTIONS,
} from "../../lib/constants";

const INITIAL_FILTERS = {
  city: "",
  area: "",
  slots: [],
  cuisines: [],
  vegPreference: "all",
};

function MultiSelectDropdown({
  id,
  label,
  placeholder,
  options,
  selectedValues,
  onToggle,
}) {
  const selectedLabel =
    selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <details className="multi-dropdown">
        <summary id={id} className="multi-dropdown-trigger">
          <span>{selectedLabel}</span>
          <span className="multi-dropdown-caret">⌄</span>
        </summary>

        <div className="multi-dropdown-menu">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);

            return (
              <label key={option} className="multi-dropdown-option">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(option)}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </details>
    </div>
  );
}

export default function UserPage() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    let ignore = false;

    async function loadCooks() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/cooks");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load cooks");
        }

        if (!ignore) {
          setCooks(Array.isArray(result.data) ? result.data : []);
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError.message || "Failed to load cooks");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCooks();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredCooks = useMemo(() => {
    return cooks.filter((cook) => {
      if (filters.city && cook.city !== filters.city) {
        return false;
      }

      if (filters.area && cook.area !== filters.area) {
        return false;
      }

      if (
        filters.slots.length > 0 &&
        !filters.slots.some((slot) => (cook.available_slots || []).includes(slot))
      ) {
        return false;
      }

      if (
        filters.cuisines.length > 0 &&
        !filters.cuisines.some((cuisine) => (cook.cuisines || []).includes(cuisine))
      ) {
        return false;
      }

      if (
        filters.vegPreference === "veg" &&
        cook.is_non_vegetarian
      ) {
        return false;
      }

      if (
        filters.vegPreference === "nonveg" &&
        !cook.is_non_vegetarian
      ) {
        return false;
      }

      return true;
    });
  }, [cooks, filters]);

  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.area ? 1 : 0) +
    filters.slots.length +
    filters.cuisines.length +
    (filters.vegPreference !== "all" ? 1 : 0);

  const updateSingleFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleMultiFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <main className="user-page">
      <div className="user-shell">
        <div className="user-topbar">
          <Link href="/" className="back-link">
            ← Back
          </Link>
        </div>

        <section className="user-hero">
          <p className="user-eyebrow">HomeCook</p>
          <h1 className="user-title">Browse cooks near you</h1>
          <p className="user-subtitle">
            Explore registered cooks and narrow the list by location,
            availability, cuisine, and veg preference.
          </p>
        </section>

        <section className="user-filters-card">
          <div className="user-filters-header">
            <div>
              <h2>Filters</h2>
              <p>{activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="user-filters-grid">
            <div className="form-field">
              <label htmlFor="user-city">City</label>
              <select
                id="user-city"
                value={filters.city}
                onChange={(e) => updateSingleFilter("city", e.target.value)}
              >
                <option value="">All cities</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="user-area">Area</label>
              <select
                id="user-area"
                value={filters.area}
                onChange={(e) => updateSingleFilter("area", e.target.value)}
              >
                <option value="">All areas</option>
                {BANGALORE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="user-veg-preference">Veg / Non-Veg</label>
              <select
                id="user-veg-preference"
                value={filters.vegPreference}
                onChange={(e) => updateSingleFilter("vegPreference", e.target.value)}
              >
                {VEG_PREFERENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <MultiSelectDropdown
              id="user-slots"
              label="Slots"
              placeholder="All slots"
              options={TIME_SLOT_OPTIONS}
              selectedValues={filters.slots}
              onToggle={(value) => toggleMultiFilter("slots", value)}
            />

            <MultiSelectDropdown
              id="user-cuisines"
              label="Cuisine"
              placeholder="All cuisines"
              options={CUISINE_OPTIONS}
              selectedValues={filters.cuisines}
              onToggle={(value) => toggleMultiFilter("cuisines", value)}
            />
          </div>
        </section>

        <section className="user-results">
          <div className="user-results-header">
            <h2>Available Cooks</h2>
            <p>{filteredCooks.length} result{filteredCooks.length === 1 ? "" : "s"}</p>
          </div>

          {loading ? <div className="user-state-card">Loading cooks...</div> : null}

          {!loading && error ? (
            <div className="user-state-card error">{error}</div>
          ) : null}

          {!loading && !error && filteredCooks.length === 0 ? (
            <div className="user-state-card">
              No cooks match the current filters. Try clearing a few filters.
            </div>
          ) : null}

          {!loading && !error && filteredCooks.length > 0 ? (
            <div className="cook-list-grid">
              {filteredCooks.map((cook) => (
                <article key={cook.id} className="cook-list-card">
                  <div className="cook-list-media">
                    {cook.photo_url ? (
                      <img
                        src={cook.photo_url}
                        alt={cook.name}
                        className="cook-list-image"
                      />
                    ) : (
                      <div className="cook-list-image-fallback">
                        {cook.name?.charAt(0) || "C"}
                      </div>
                    )}
                  </div>

                  <div className="cook-list-body">
                    <div className="cook-list-heading">
                      <h3>{cook.name}</h3>
                      <span className={cook.is_non_vegetarian ? "food-tag nonveg" : "food-tag veg"}>
                        {cook.is_non_vegetarian ? "Can Cook Non-Veg" : "Vegetarian"}
                      </span>
                    </div>

                    <p className="cook-location">
                      {cook.area}, {cook.city}
                    </p>

                    <div className="cook-meta-block">
                      <p className="cook-meta-label">Available Slots</p>
                      <div className="cook-tag-group">
                        {(cook.available_slots || []).map((slot) => (
                          <span key={slot} className="cook-tag">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="cook-meta-block">
                      <p className="cook-meta-label">Cuisines</p>
                      <div className="cook-tag-group">
                        {(cook.cuisines || []).map((cuisine) => (
                          <span key={cuisine} className="cook-tag">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
