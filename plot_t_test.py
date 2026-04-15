"""
T-Test for Football Data Analysis
Mathematical Modelling for Football Course

This script performs and visualises t-tests
to compare means of football performance metrics
across different groups or conditions.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy import stats


def perform_t_test(sample_1, sample_2, test_type="independent", alpha=0.05):
    """
    Perform a t-test on two samples.

    Parameters
    ----------
    sample_1 : array-like
        First sample of observations.
    sample_2 : array-like
        Second sample of observations.
    test_type : str
        'independent' for independent samples t-test,
        'paired' for paired samples t-test.
    alpha : float
        Significance level (default 0.05).

    Returns
    -------
    dict
        Test statistic, p-value, descriptive statistics, and decision.
    """
    sample_1 = np.array(sample_1)
    sample_2 = np.array(sample_2)

    if test_type == "paired":
        t_stat, p_value = stats.ttest_rel(sample_1, sample_2)
    else:
        t_stat, p_value = stats.ttest_ind(sample_1, sample_2)

    return {
        "test_type": test_type,
        "t_statistic": t_stat,
        "p_value": p_value,
        "mean_1": np.mean(sample_1),
        "mean_2": np.mean(sample_2),
        "std_1": np.std(sample_1, ddof=1),
        "std_2": np.std(sample_2, ddof=1),
        "n_1": len(sample_1),
        "n_2": len(sample_2),
        "reject_null": p_value < alpha,
        "alpha": alpha,
    }


def plot_t_test_results(sample_1, sample_2, result, labels=("Sample 1", "Sample 2"),
                        title="T-Test Results"):
    """
    Visualise t-test results with distributions and summary.

    Parameters
    ----------
    sample_1 : array-like
        First sample of observations.
    sample_2 : array-like
        Second sample of observations.
    result : dict
        Output from perform_t_test().
    labels : tuple of str
        Labels for the two samples.
    title : str
        Plot title.
    """
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))

    # Histogram overlay
    axes[0].hist(sample_1, bins=12, alpha=0.6, color="#3498db", label=labels[0], edgecolor="black")
    axes[0].hist(sample_2, bins=12, alpha=0.6, color="#e74c3c", label=labels[1], edgecolor="black")
    axes[0].axvline(result["mean_1"], color="#2980b9", linestyle="--", linewidth=2, label=f"Mean {labels[0]}")
    axes[0].axvline(result["mean_2"], color="#c0392b", linestyle="--", linewidth=2, label=f"Mean {labels[1]}")
    axes[0].set_xlabel("Value")
    axes[0].set_ylabel("Frequency")
    axes[0].set_title("Sample Distributions")
    axes[0].legend(fontsize=8)

    # Box plot comparison
    bp = axes[1].boxplot(
        [sample_1, sample_2],
        labels=labels,
        patch_artist=True,
        boxprops=dict(linewidth=1.5),
        medianprops=dict(color="black", linewidth=2),
    )
    bp["boxes"][0].set_facecolor("#3498db")
    bp["boxes"][1].set_facecolor("#e74c3c")
    axes[1].set_ylabel("Value")
    axes[1].set_title("Box Plot Comparison")

    # T-distribution under H0
    df = result["n_1"] + result["n_2"] - 2
    x = np.linspace(-4, 4, 300)
    y = stats.t.pdf(x, df)
    axes[2].plot(x, y, "k-", linewidth=2, label=f"t-distribution (df={df})")
    axes[2].fill_between(x, y, alpha=0.1, color="grey")

    # Shade rejection regions
    t_crit = stats.t.ppf(1 - result["alpha"] / 2, df)
    x_reject_right = x[x >= t_crit]
    x_reject_left = x[x <= -t_crit]
    axes[2].fill_between(x_reject_right, stats.t.pdf(x_reject_right, df), alpha=0.3, color="red",
                         label=f"Rejection region (α={result['alpha']})")
    axes[2].fill_between(x_reject_left, stats.t.pdf(x_reject_left, df), alpha=0.3, color="red")

    # Mark test statistic
    axes[2].axvline(result["t_statistic"], color="blue", linestyle="--", linewidth=2,
                    label=f"t = {result['t_statistic']:.3f}")
    axes[2].set_xlabel("t")
    axes[2].set_ylabel("Density")
    axes[2].set_title("T-Distribution & Test Statistic")
    axes[2].legend(fontsize=8)

    significance = "Reject H₀" if result["reject_null"] else "Fail to reject H₀"
    fig.suptitle(
        f"{title}\nt = {result['t_statistic']:.4f}, p = {result['p_value']:.4f} | {significance}",
        fontsize=13,
    )
    plt.tight_layout()
    plt.savefig("t_test_results.png", dpi=150, bbox_inches="tight")
    plt.show()


if __name__ == "__main__":
    # Example: compare expected goals (xG) between two teams
    np.random.seed(42)
    team_a_xg = np.random.normal(loc=1.5, scale=0.6, size=38)  # 38 match-weeks
    team_b_xg = np.random.normal(loc=1.2, scale=0.5, size=38)

    print("Team A xG (first 10):", np.round(team_a_xg[:10], 2))
    print("Team B xG (first 10):", np.round(team_b_xg[:10], 2))

    result = perform_t_test(team_a_xg, team_b_xg, test_type="independent")
    print("\nT-Test Results:")
    for key, value in result.items():
        print(f"  {key}: {value}")

    plot_t_test_results(
        team_a_xg,
        team_b_xg,
        result,
        labels=("Team A xG", "Team B xG"),
        title="Independent T-Test: Team A vs Team B Expected Goals (xG)",
    )
