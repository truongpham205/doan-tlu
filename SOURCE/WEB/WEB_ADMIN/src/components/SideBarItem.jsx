import React, { PureComponent } from 'react'
export default class SideBarItem extends PureComponent {
  render() {
    return (
      <>
        {this.props.listRouter.map((value, index) => {
          if (value.getAccess) {
            if (!value.subMenu.length) {
              return (
                <li
                  key={index}
                  className="hoved nav-item"
                  data-widget={this.props.width < 990 && 'pushmenu'}
                  onClick={() => this.props.action(value.route)}
                >
                  <a
                    className={
                      this.props.pathName === value.route
                        ? 'nav-link cursor nav-link-hover nav__active--link'
                        : 'nav-link cursor nav-link-hover'
                    }
                  >
                    <i className={value.icon} />
                    <p className="me-txt-menu">{value.name}</p>
                    {value?.badge ? (
                      <span className="badge badge-warning right">
                        {typeof value.badge === 'number' ? value.badge : <i className="fas fa-comment-dots"></i>}
                      </span>
                    ) : (
                      ''
                    )}
                    {/* <span class="badge badge-warning right">{value.badge}</span> */}
                  </a>
                </li>
              )
            }
            return (
              <li className="nav-item has-treeview" key={index}>
                <a className="nav-link cursor" href="">
                  <i className={value.mainIcon}></i>
                  <p className="me-txt-menu">
                    {value.name}
                    <i className={value.icon}></i>
                  </p>
                  {value?.badge ? <span className="badge badge-warning mr-1 float-right">{value?.badge}</span> : ''}
                </a>
                <ul className="nav nav-treeview me-menu-drop">
                  {value.subMenu?.map((item, ind) => {
                    return (
                      <li
                        key={ind}
                        className="nav-item sub-menu hoved"
                        data-widget={this.props.width < 990 && 'pushmenu'}
                        onClick={() => this.props.action(item.route)}
                      >
                        <a
                          className={
                            this.props.pathName === item.route
                              ? 'nav-link cursor nav-link-hover nav__active--link'
                              : 'nav-link cursor nav-link-hover'
                          }
                          style={{ flex: 1 }}
                        >
                          <p className="me-txt-menu" style={{ marginLeft: '31px' }}>
                            {item.name}
                          </p>
                          {item?.badge ? (
                            <span className="badge mr-1  badge-warning float-right">{item.badge}</span>
                          ) : (
                            ''
                          )}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          }
        })}
      </>
    )
  }
}
