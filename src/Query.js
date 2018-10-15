import React from "react";
import getData from "./getData";
import { RouteQLContext } from "./Provider";

class Query extends React.Component {
  constructor(props) {
    super(props);
    this.state = { [this.props.name || "data"]: { loading: true } };
  }

  componentDidMount() {
    const {
      query,
      endpoint,
      requestDataForField,
      resolver,
      pollInterval,
      cachePolicy,
      config,
      name,
      ...props
    } = this.props;
    const dataKey = name || "data";
    if (pollInterval && typeof pollInterval === "number") {
      this.interval = setInterval(
        () =>
          getData({
            query,
            endpoint,
            requestDataForField,
            resolver,
            config,
            props,
            cachePolicy: "network-only"
          }).then(data =>
            this.setState({
              [dataKey]: Object.assign({}, this.state[dataKey], data)
            })
          ),
        pollInterval
      );
    }

    getData({
      query,
      endpoint,
      requestDataForField,
      resolver,
      config,
      cachePolicy: cachePolicy || config.cachePolicy,
      props
    }).then(data =>
      this.setState({
        [dataKey]: Object.assign(
          {},
          this.state[dataKey],
          { loading: false },
          data
        )
      })
    );
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const {
      query,
      endpoint,
      requestDataForField,
      resolver,
      pollInterval,
      cachePolicy,
      children,
      config,
      ...props
    } = this.props;
    return children(
      Object.assign(
        {
          refetch: () =>
            getData({
              query,
              endpoint,
              requestDataForField,
              resolver,
              config,
              props,
              cachePolicy: "network-only"
            }).then(data =>
              this.setState({
                [dataKey]: Object.assign({}, this.state[dataKey], data)
              })
            )
        },
        this.state
      )
    );
  }
}

export default function ConfigConsumer(props) {
  return (
    <RouteQLContext.Consumer>
      {config => <Query config={config} {...props} />}
    </RouteQLContext.Consumer>
  );
}
