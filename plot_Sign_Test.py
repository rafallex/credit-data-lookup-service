"""
Sign Test for Football Data Analysis
Mathematical Modelling for Football Course

This script performs and visualises a sign test,
a non-parametric statistical test used to compare
paired observations in football match data.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy import stats


def sign_test(sample_1, sample_2, alpha=0.05):
    """
    Perform a sign test on paired samples.

    Parameters
    ----------
    sample_1 : array-like
        First set of observations (e.g., home goals).
    sample_2 : array-like
        Second set of observations (e.g., away goals).
    alpha : float
        Significance level (default 0.05).

    Returns
    -------
    dict
        Test statistic, p-value, and whether to reject H0.
    """
    differences = np.array(sample_1) - np.array(sample_2)
    # Remove zeros (ties)
    differences = differences[differences != 0]
    n = len(differences)

    # Count positives
    n_positive = np.sum(differences > 0)
    n_negative = np.sum(differences < 0)

    # Test statistic is the smaller of the two counts
    test_stat = min(n_positive, n_negative)

    # Two-sided p-value using the binomial distribution
    p_value = 2 * stats.binom.cdf(test_stat, n, 0.5)

    return {
        "n_positive": n_positive,
        "n_negative": n_negative,
        "n_ties_removed": len(sample_1) - n,
        "test_statistic": test_stat,
        "p_value": p_value,
        "reject_null": p_value < alpha,
        "alpha": alpha,
    }


def plot_sign_test_results(result, title="Sign Test Results"):
    """
    Visualise the results of a sign test.

    Parameters
    ----------
    result : dict
        Output from sign_test().
    title : str
        Plot title.
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Bar chart of positive vs negative differences
    categories = ["Positive\n(Sample 1 > Sample 2)", "Negative\n(Sample 1 < Sample 2)"]
    counts = [result["n_positive"], result["n_negative"]]
    colours = ["#2ecc71", "#e74c3c"]

    axes[0].bar(categories, counts, color=colours, edgecolor="black", linewidth=0.8)
    axes[0].set_ylabel("Count")
    axes[0].set_title("Direction of Differences")
    for i, count in enumerate(counts):
        axes[0].text(i, count + 0.3, str(count), ha="center", fontweight="bold", fontsize=12)

    # Binomial distribution under H0
    n = result["n_positive"] + result["n_negative"]
    x = np.arange(0, n + 1)
    pmf = stats.binom.pmf(x, n, 0.5)

    axes[1].bar(x, pmf, color="lightsteelblue", edgecolor="black", linewidth=0.5, label="Binomial(n, 0.5)")
    axes[1].axvline(
        result["test_statistic"],
        color="red",
        linestyle="--",
        linewidth=2,
        label=f"Test stat = {result['test_statistic']}",
    )
    axes[1].set_xlabel("Number of positive (or negative) signs")
    axes[1].set_ylabel("Probability")
    axes[1].set_title("Null Distribution (Binomial)")
    axes[1].legend()

    significance = "Reject H₀" if result["reject_null"] else "Fail to reject H₀"
    fig.suptitle(f"{title}\np-value = {result['p_value']:.4f} | α = {result['alpha']} | {significance}", fontsize=13)
    plt.tight_layout()
    plt.savefig("sign_test_results.png", dpi=150, bbox_inches="tight")
    plt.show()


if __name__ == "__main__":
    # Example: compare home goals vs away goals across matches
    np.random.seed(42)
    home_goals = np.random.poisson(lam=1.5, size=30)
    away_goals = np.random.poisson(lam=1.1, size=30)

    print("Home goals:", home_goals)
    print("Away goals:", away_goals)

    result = sign_test(home_goals, away_goals)
    print("\nSign Test Results:")
    for key, value in result.items():
        print(f"  {key}: {value}")

    plot_sign_test_results(result, title="Sign Test: Home vs Away Goals")
